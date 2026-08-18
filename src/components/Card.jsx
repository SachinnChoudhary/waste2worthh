export function Card({ className = '', hover = true, children, ...props }) {
  return (
    <div
      className={`bg-white rounded-xl border border-sage-200 shadow-sm ${hover ? 'hover:shadow-md hover:border-forest-200 transition-all duration-200' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return <div className={`px-5 pt-5 pb-2 ${className}`}>{children}</div>
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>
}
