import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2, TrendingUp } from 'lucide-react'

const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY

export default function GifPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const [gifs, setGifs] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    fetchTrending()
  }, [])

  // Debounced search as you type
  useEffect(() => {
    if (!query.trim()) {
      if (searched) {
        setSearched(false)
        fetchTrending()
      }
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      searchGifs(query.trim())
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  async function fetchTrending() {
    setLoading(true)
    try {
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&rating=g`
      )
      const data = await res.json()
      setGifs(data.data || [])
    } catch {
      setGifs([])
    }
    setLoading(false)
  }

  async function searchGifs(term) {
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(term)}&limit=20&rating=g`
      )
      const data = await res.json()
      setGifs(data.data || [])
    } catch {
      setGifs([])
    }
    setLoading(false)
  }

  return (
    <div className="animate-slide-up">
      {/* Search bar */}
      <div className="p-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost" />
          <input
            ref={inputRef}
            type="text"
            placeholder='Search GIFs... (e.g. "excited cat")'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-dark border border-slate-light/30 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-ghost/50 focus:outline-none focus:border-neon-cyan/50 transition-colors"
          />
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-slate-dark border border-slate-light/30 text-ghost hover:text-neon-pink hover:border-neon-pink/30 transition-all cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Label */}
      <div className="px-4 pb-2 flex items-center gap-1.5">
        <TrendingUp size={12} className="text-neon-yellow" />
        <span className="text-[11px] font-semibold text-ghost uppercase tracking-wider">
          {searched ? `Results for "${query}"` : 'Trending'}
        </span>
      </div>

      {/* GIF Grid */}
      <div className="h-[280px] overflow-y-auto px-3 pb-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={28} className="text-neon-cyan animate-spin" />
          </div>
        ) : gifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-ghost text-sm">No GIFs found</p>
            <p className="text-ghost/50 text-xs font-mono mt-1">try different keywords</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => onSelect(gif)}
                className="gif-grid-item relative rounded-xl overflow-hidden cursor-pointer bg-slate-dark aspect-square"
              >
                <img
                  src={gif.images.fixed_height_small.url}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-[10px] font-mono text-white/80 truncate w-full">
                    {gif.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Giphy attribution */}
      <div className="px-4 py-2 border-t border-slate-light/20 flex items-center justify-center">
        <span className="text-[10px] text-ghost/40 font-mono">Powered by GIPHY</span>
      </div>
    </div>
  )
}
