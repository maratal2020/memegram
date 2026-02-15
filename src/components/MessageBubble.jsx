export default function MessageBubble({ message, isOwn, senderName }) {
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-float-in`}>
      <div className={`max-w-[320px] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Sender + time */}
        <div className={`flex items-center gap-2 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className={`text-xs font-semibold ${isOwn ? 'text-neon-cyan' : 'text-neon-pink'}`}>
            {isOwn ? 'You' : senderName}
          </span>
          <span className="text-[10px] text-ghost font-mono">{time}</span>
        </div>

        {/* GIF */}
        <div
          className={`
            rounded-2xl overflow-hidden border-2 transition-shadow
            ${isOwn
              ? 'border-neon-cyan/30 shadow-lg shadow-neon-cyan/10 rounded-tr-sm'
              : 'border-neon-pink/30 shadow-lg shadow-neon-pink/10 rounded-tl-sm'
            }
          `}
        >
          <img
            src={message.gif_url}
            alt={message.gif_title || 'GIF'}
            className="w-full h-auto block bg-slate-dark min-h-[100px]"
            loading="lazy"
          />
        </div>

        {message.gif_title && (
          <p className="text-[10px] text-ghost/40 font-mono px-1 truncate max-w-full">
            {message.gif_title}
          </p>
        )}
      </div>
    </div>
  )
}
