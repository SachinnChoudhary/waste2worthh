/* Leaf-loop logo mark for Waste2Worth */
export function Logo({ size = 'md', showText = true }) {
  const sizes = { sm: 28, md: 36, lg: 48 }
  const s = sizes[size] || sizes.md

  return (
    <a href="/" className="flex items-center gap-2 no-underline group">
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Circular arrow loop */}
        <path
          d="M24 6C13.1 6 4.2 13.7 2.3 24h4.1C8.2 16 15.5 10 24 10c7.7 0 14.3 5 16.8 12h-6.3l8.5 9 8.5-9h-6.2C42.8 11.2 34.2 6 24 6z"
          fill="var(--color-forest-500)"
          opacity="0.7"
        />
        <path
          d="M24 42c10.9 0 19.8-7.7 21.7-18h-4.1C39.8 32 32.5 38 24 38c-7.7 0-14.3-5-16.8-12h6.3L5 17l-8.5 9h6.2C5.2 36.8 13.8 42 24 42z"
          fill="var(--color-forest-400)"
          opacity="0.7"
        />
        {/* Leaf in center */}
        <path
          d="M24 16c-6 4-8 12-4 16 2-4 6-8 12-10-2 6-4 10-8 12 6-2 10-8 10-14-4 0-8 0-10-4z"
          fill="var(--color-forest-600)"
        />
      </svg>
      {showText && (
        <span className="font-display text-forest-900 text-xl tracking-tight group-hover:text-forest-600 transition-colors">
          Waste<span className="text-forest-500">2</span>Worth
        </span>
      )}
    </a>
  )
}
