import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [selectedChat, setSelectedChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) fetchProfile(session.user.id)
        else {
          setProfile(null)
          setSelectedChat(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile({
        ...data,
        email: session?.user?.email || '',
      })
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <div className="text-center animate-float-in">
          <div className="text-5xl mb-4 animate-pulse">🎭</div>
          <p className="text-ghost text-sm font-mono">loading memegram...</p>
        </div>
      </div>
    )
  }

  if (!session || !profile) {
    return <Auth />
  }

  return (
    <div className="h-screen flex overflow-hidden bg-void">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-void/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        currentUser={profile}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <ChatWindow
        currentUser={profile}
        selectedChat={selectedChat}
        onOpenMobile={() => setMobileMenuOpen(true)}
      />

      <div className="noise-overlay" />
    </div>
  )
}
