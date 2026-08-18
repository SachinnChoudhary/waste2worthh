export function Card({
  variant = 'default',
  hover = false,
  className = '',
  children,
  ...props
}) {
  return (
    <div
      className={`rounded-2xl surface-card relative overflow-hidden transition-all duration-200 ${
        hover ? 'surface-card-hover cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', action = null }) {
  return (
    <div className={`p-6 pb-3 flex items-start justify-between gap-4 border-b border-white/[0.06] ${className}`}>
      <div className="flex flex-col gap-1 flex-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function CardTitle({ children, className = '', as: Tag = 'h3' }) {
  return (
    <Tag className={`text-base font-bold text-zinc-100 tracking-tight ${className}`}>
      {children}
    </Tag>
  )
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className="text-xs text-zinc-400 leading-relaxed font-normal">
      {children}
    </p>
  )
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-t border-white/[0.06] bg-black/20 flex items-center justify-between gap-3 ${className}`}>
      {children}
    </div>
  )
}
