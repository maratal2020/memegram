import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Sparkles, LogIn, UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      if (!username.trim()) {
        setError('Username is required')
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username.trim() } },
      })
      if (error) setError(error.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-void relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-neon-pink/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-neon-cyan/10 blur-[120px]" />
      <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-neon-purple/8 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md mx-4 animate-float-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center text-2xl shadow-lg shadow-neon-pink/30">
              🎭
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan bg-clip-text text-transparent">
            Memegram
          </h1>
          <p className="text-ghost mt-2 text-sm font-mono">
            speak in GIFs or don&apos;t speak at all
          </p>
        </div>

        {/* Card */}
        <div className="bg-abyss/80 backdrop-blur-xl rounded-2xl p-8 neon-border">
          {/* Toggle tabs */}
          <div className="flex gap-1 bg-slate-dark rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                isLogin
                  ? 'bg-neon-pink text-white shadow-lg shadow-neon-pink/30'
                  : 'text-ghost hover:text-whisper'
              }`}
            >
              <LogIn size={16} /> Login
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null) }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                !isLogin
                  ? 'bg-neon-cyan text-void shadow-lg shadow-neon-cyan/30'
                  : 'text-ghost hover:text-whisper'
              }`}
            >
              <UserPlus size={16} /> Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative animate-float-in">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost" />
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-dark border border-slate-light/50 rounded-xl py-3 pl-11 pr-4 text-white placeholder-ghost/60 focus:outline-none focus:border-neon-cyan/60 focus:ring-1 focus:ring-neon-cyan/30 transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-dark border border-slate-light/50 rounded-xl py-3 pl-11 pr-4 text-white placeholder-ghost/60 focus:outline-none focus:border-neon-cyan/60 focus:ring-1 focus:ring-neon-cyan/30 transition-all"
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ghost" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-dark border border-slate-light/50 rounded-xl py-3 pl-11 pr-4 text-white placeholder-ghost/60 focus:outline-none focus:border-neon-cyan/60 focus:ring-1 focus:ring-neon-cyan/30 transition-all"
              />
            </div>

            {error && (
              <div className="bg-neon-pink/10 border border-neon-pink/30 rounded-xl px-4 py-2.5 text-neon-pink text-sm animate-float-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan text-white shadow-lg hover:shadow-neon-pink/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={18} />
                  {isLogin ? 'Enter the Meme Zone' : 'Join the Meme Zone'}
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-ghost/50 text-xs mt-6 font-mono">
          powered by GIFs & vibes ✦
        </p>
      </div>

      <div className="noise-overlay" />
    </div>
  )
}
