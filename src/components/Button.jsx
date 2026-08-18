const base = 'inline-flex items-center justify-center font-body font-medium rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest-400 focus:ring-offset-2 focus:ring-offset-cream'

const variants = {
  primary: 'bg-forest-600 text-white hover:bg-forest-700 active:bg-forest-800 shadow-sm hover:shadow-md',
  secondary: 'bg-earth-100 text-earth-800 hover:bg-earth-200 active:bg-earth-300 border border-earth-200',
  outline: 'border-2 border-forest-500 text-forest-700 hover:bg-forest-50 active:bg-forest-100',
  ghost: 'text-forest-700 hover:bg-forest-50 active:bg-forest-100',
  danger: 'bg-terra-500 text-white hover:bg-terra-600 active:bg-terra-600',
}

const sizes = {
  sm: 'text-sm px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2.5 gap-2',
  lg: 'text-base px-6 py-3 gap-2',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
