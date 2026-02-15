import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Search, LogOut, Users, MessageCircle, X, Menu } from 'lucide-react'

export default function Sidebar({ currentUser, selectedChat, onSelectChat, mobileOpen, onCloseMobile }) {
  const [profiles, setProfiles] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('username')
    if (data) setProfiles(data.filter((p) => p.id !== currentUser.id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  const filtered = profiles.filter((p) =>
    p.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <aside
      className={`
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:relative z-40
        w-80 h-full bg-abyss border-r border-slate-light/30
        flex flex-col transition-transform duration-300 ease-out
      `}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-light/20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center text-lg shadow-md shadow-neon-pink/20">
            🎭
          </div>
          <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-neon-pink to-neon-cyan bg-clip-text text-transparent">
            Memegram
          </span>
        </div>
        <button
          onClick={onCloseMobile}
          className="md:hidden p-2 rounded-lg text-ghost hover:text-white hover:bg-slate-mid transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Current user */}
      <div className="px-4 py-3 border-b border-slate-light/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-sm font-bold text-void shrink-0">
            {currentUser.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{currentUser.username}</p>
            <p className="text-xs text-ghost font-mono truncate">{currentUser.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-ghost hover:text-neon-pink hover:bg-neon-pink/10 transition-all cursor-pointer"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost" />
          <input
            type="text"
            placeholder="Find a friend..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-dark border border-slate-light/30 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-ghost/50 focus:outline-none focus:border-neon-cyan/50 transition-colors"
          />
        </div>
      </div>

      {/* User list header */}
      <div className="px-4 py-2 flex items-center gap-2">
        <Users size={14} className="text-ghost" />
        <span className="text-xs font-semibold text-ghost uppercase tracking-wider">
          Online Memers ({filtered.length})
        </span>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ghost text-sm">No memers found</p>
            <p className="text-ghost/50 text-xs mt-1 font-mono">invite your friends!</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filtered.map((profile) => {
              const isSelected = selectedChat?.id === profile.id
              return (
                <button
                  key={profile.id}
                  onClick={() => {
                    onSelectChat(profile)
                    onCloseMobile()
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer
                    ${isSelected
                      ? 'bg-gradient-to-r from-neon-pink/15 to-neon-purple/10 border border-neon-pink/30'
                      : 'hover:bg-slate-mid/60 border border-transparent'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                    ${isSelected
                      ? 'bg-gradient-to-br from-neon-pink to-neon-purple text-white shadow-md shadow-neon-pink/20'
                      : 'bg-slate-mid text-ghost'
                    }
                  `}>
                    {profile.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-whisper'}`}>
                      {profile.username}
                    </p>
                    <p className="text-xs text-ghost/60 font-mono flex items-center gap-1">
                      <MessageCircle size={10} /> tap to send memes
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
