import { Search } from 'lucide-react'
import { Button } from './Button'

export function EmptyState({
  icon = <Search className="w-8 h-8 text-fg-muted" />,
  title = 'No results found',
  description = 'Try adjusting your search criteria or clear your current filters to view available materials.',
  actionLabel = 'Reset Filters',
  onAction = null,
  className = '',
}) {
  return (
    <div
      className={`surface-card rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-fg-primary mb-1.5">{title}</h3>
      <p className="text-xs text-fg-secondary max-w-xs mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
