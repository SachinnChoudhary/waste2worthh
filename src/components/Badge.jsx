const badgeVariants = {
  emerald: {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
  },
  cyan: {
    bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
    dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]',
  },
  amber: {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
  },
  rose: {
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]',
  },
  purple: {
    bg: 'bg-purple-500/10 text-purple-300 border-purple-500/25',
    dot: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]',
  },
  zinc: {
    bg: 'bg-white/[0.05] text-fg-secondary border-white/[0.08]',
    dot: 'bg-zinc-400',
  },
  blue: {
    bg: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]',
  },
  // Legacy aliases for backwards compatibility
  green: {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
  },
  red: {
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    dot: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]',
  },
  neutral: {
    bg: 'bg-white/[0.05] text-fg-secondary border-white/[0.08]',
    dot: 'bg-zinc-400',
  },
  brown: {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
  },
  sage: {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
}

const badgeSizes = {
  sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
  md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  lg: 'text-xs px-3 py-1.5 gap-2 font-semibold',
}

export function Badge({
  variant = 'emerald',
  color = null, // fallback for legacy prop
  size = 'md',
  dot = false,
  pulse = false,
  icon = null,
  className = '',
  children,
  ...props
}) {
  const chosenVariant = color || variant
  const config = badgeVariants[chosenVariant] || badgeVariants.zinc

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-sm transition-all duration-150 select-none ${config.bg} ${badgeSizes[size] || badgeSizes.md} ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 items-center justify-center">
          {pulse && (
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.dot}`}
            />
          )}
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${config.dot}`} />
        </span>
      )}
      {icon && <span className="inline-flex shrink-0 items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
