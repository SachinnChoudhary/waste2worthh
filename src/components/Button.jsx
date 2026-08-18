import { forwardRef } from 'react'

const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-150 ease-out select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed active:scale-[0.98]'

const variants = {
  primary: `
    bg-gradient-to-b from-emerald-400 to-emerald-500 text-emerald-950 font-semibold
    shadow-[0_1px_2px_rgba(0,0,0,0.4),0_0_20px_-2px_rgba(52,211,153,0.35),inset_0_1px_0_rgba(255,255,255,0.4)]
    hover:from-emerald-300 hover:to-emerald-400 hover:shadow-[0_0_28px_-2px_rgba(52,211,153,0.55),inset_0_1px_0_rgba(255,255,255,0.5)]
    border border-emerald-400/60
  `,
  secondary: `
    bg-zinc-900/80 text-fg-primary
    border border-white/10
    shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
    hover:bg-zinc-800/90 hover:border-white/20 hover:text-white
  `,
  outline: `
    bg-transparent text-emerald-400
    border border-emerald-500/30
    hover:bg-emerald-500/10 hover:border-emerald-400/60 hover:text-emerald-300
  `,
  ghost: `
    bg-transparent text-fg-secondary
    hover:bg-white/[0.07] hover:text-fg-primary
  `,
  danger: `
    bg-gradient-to-b from-rose-500 to-rose-600 text-white font-semibold
    shadow-[0_1px_2px_rgba(0,0,0,0.4),0_0_16px_-2px_rgba(244,63,94,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]
    hover:from-rose-400 hover:to-rose-500 hover:shadow-[0_0_24px_-2px_rgba(244,63,94,0.5)]
    border border-rose-400/50
  `,
  subtle: `
    bg-white/[0.04] text-fg-secondary border border-white/[0.06]
    hover:bg-white/[0.08] hover:text-fg-primary hover:border-white/[0.12]
  `,
}

const sizes = {
  xs: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 h-7',
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 h-8.5 font-medium',
  md: 'text-sm px-4 py-2 rounded-xl gap-2 h-10',
  lg: 'text-base px-5 py-2.5 rounded-xl gap-2.5 h-12 font-semibold',
  icon: 'p-2 rounded-xl h-9 w-9 justify-center',
  'icon-sm': 'p-1.5 rounded-lg h-7 w-7 justify-center',
}

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon = null,
    rightIcon = null,
    fullWidth = false,
    className = '',
    children,
    disabled,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-0.5 h-4 w-4 text-current opacity-80"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon && <span className="inline-flex shrink-0 items-center justify-center">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0 items-center justify-center">{rightIcon}</span>
      )}
    </button>
  )
})
