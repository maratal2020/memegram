import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Menu, Smile } from 'lucide-react'
import MessageBubble from './MessageBubble'
import GifPicker from './GifPicker'

export default function ChatWindow({ currentUser, selectedChat, onOpenMobile }) {
  const [messages, setMessages] = useState([])
  const [showGifPicker, setShowGifPicker] = useState(false)
  const bottomRef = useRef(null)

  // Fetch existing messages for this conversation
  useEffect(() => {
    if (!selectedChat) return
    setMessages([])
    setShowGifPicker(false)

    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedChat.id}),and(sender_id.eq.${selectedChat.id},receiver_id.eq.${currentUser.id})`
        )
        .order('created_at', { ascending: true })

      if (data) setMessages(data)
    }

    fetchMessages()
  }, [selectedChat, currentUser.id])

  // Real-time subscription
  useEffect(() => {
    if (!selectedChat) return

    const channel = supabase
      .channel(`chat-${[currentUser.id, selectedChat.id].sort().join('-')}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new
          const isRelevant =
            (msg.sender_id === currentUser.id && msg.receiver_id === selectedChat.id) ||
            (msg.sender_id === selectedChat.id && msg.receiver_id === currentUser.id)
          if (isRelevant) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev
              return [...prev, msg]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedChat, currentUser.id])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send a GIF
  async function handleSendGif(gif) {
    const gifUrl = gif.images.fixed_height.url
    const gifTitle = gif.title

    // Optimistic insert
    const tempMsg = {
      id: crypto.randomUUID(),
      sender_id: currentUser.id,
      receiver_id: selectedChat.id,
      gif_url: gifUrl,
      gif_title: gifTitle,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMsg])
    setShowGifPicker(false)

    await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: selectedChat.id,
      gif_url: gifUrl,
      gif_title: gifTitle,
    })
  }

  // Empty state — no chat selected
  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-void relative">
        <button
          onClick={onOpenMobile}
          className="absolute top-4 left-4 md:hidden p-2 rounded-lg text-ghost hover:text-white hover:bg-slate-mid transition-colors cursor-pointer"
        >
          <Menu size={22} />
        </button>
        <div className="text-center animate-float-in">
          <div className="text-6xl mb-4">🎭</div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent mb-2">
            Welcome to Memegram
          </h2>
          <p className="text-ghost text-sm max-w-xs mx-auto">
            Pick a friend from the sidebar and start communicating through the universal language of GIFs.
          </p>
        </div>
        <div className="noise-overlay" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-void relative h-full">
      {/* Chat header */}
      <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-light/20 bg-abyss/60 backdrop-blur-md shrink-0">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 -ml-2 rounded-lg text-ghost hover:text-white hover:bg-slate-mid transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center text-sm font-bold text-white shadow-md shadow-neon-pink/20">
          {selectedChat.username[0].toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-white text-sm">{selectedChat.username}</p>
          <p className="text-xs text-ghost font-mono">GIF chat</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-3 opacity-50">💬</div>
            <p className="text-ghost text-sm">No memes yet.</p>
            <p className="text-ghost/50 text-xs font-mono mt-1">break the ice with a GIF!</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.sender_id === currentUser.id}
            senderName={selectedChat.username}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* GIF Picker toggle */}
      <div className="border-t border-slate-light/20 bg-abyss/60 backdrop-blur-md shrink-0">
        {showGifPicker ? (
          <GifPicker onSelect={handleSendGif} onClose={() => setShowGifPicker(false)} />
        ) : (
          <div className="p-3">
            <button
              onClick={() => setShowGifPicker(true)}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-gradient-to-r from-neon-pink/15 to-neon-cyan/15 border border-slate-light/30 text-whisper hover:border-neon-pink/40 hover:text-white transition-all cursor-pointer group"
            >
              <Smile size={20} className="text-neon-pink group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-sm">Search & Send a GIF</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
