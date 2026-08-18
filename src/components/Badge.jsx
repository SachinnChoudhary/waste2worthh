const colors = {
  green: 'bg-forest-100 text-forest-700 border-forest-200',
  brown: 'bg-earth-100 text-earth-700 border-earth-200',
  red: 'bg-terra-100 text-terra-600 border-terra-200',
  sage: 'bg-sage-100 text-forest-600 border-sage-200',
  neutral: 'bg-warm-white text-bark border-sage-200',
}

export function Badge({ color = 'green', children, className = '' }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
