import { Link } from 'react-router-dom'

export function Logo({ size = 'md', showText = true, className = '' }) {
  const sizeMap = {
    sm: { icon: 26, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 40, text: 'text-2xl' },
  }

  const { icon, text } = sizeMap[size] || sizeMap.md

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 no-underline group select-none ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Ambient glow behind mark */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-cyan-500/20 rounded-xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* High-tech vector mark */}
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)] transition-transform duration-300 group-hover:scale-105"
        >
          <rect width="36" height="36" rx="10" fill="#0e1713" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          
          {/* Circular loop arrows in emerald/cyan gradient */}
          <path
            d="M18 8C12.477 8 8 12.477 8 18C8 19.8 8.48 21.48 9.32 22.92L11.5 21.5C10.9 20.46 10.5 19.26 10.5 18C10.5 13.86 13.86 10.5 18 10.5C20.32 10.5 22.38 11.56 23.76 13.22L21 15H27V9L24.88 11.12C23.16 9.22 20.72 8 18 8Z"
            fill="url(#logo-grad-1)"
          />
          <path
            d="M18 28C23.523 28 28 23.523 28 18C28 16.2 27.52 14.52 26.68 13.08L24.5 14.5C25.1 15.54 25.5 16.74 25.5 18C25.5 22.14 22.14 25.5 18 25.5C15.68 25.5 13.62 24.44 12.24 22.78L15 21H9V27L11.12 24.88C12.84 26.78 15.28 28 18 28Z"
            fill="url(#logo-grad-2)"
          />
          {/* Inner spark leaf */}
          <circle cx="18" cy="18" r="2.5" fill="#34d399" />

          <defs>
            <linearGradient id="logo-grad-1" x1="8" y1="8" x2="27" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34d399" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="logo-grad-2" x1="28" y1="28" x2="9" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10b981" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-fg-primary ${text} leading-none`}>
            Waste<span className="text-emerald-400 font-extrabold">2</span>Worth
          </span>
          <span className="text-[9px] uppercase tracking-widest text-fg-muted font-mono font-medium mt-0.5">
            Circular SaaS
          </span>
        </div>
      )}
    </Link>
  )
}
