import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

export function StatCard({
  title,
  value,
  trend = null, // e.g. "+14.2%" or "-3.5%"
  trendLabel = 'vs last month',
  isPositive = true,
  icon = null,
  description = null,
  accentColor = 'emerald',
  className = '',
}) {
  const accentStyles = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  }

  return (
    <div
      className={`surface-card rounded-2xl p-5 relative overflow-hidden transition-all duration-200 hover:border-white/15 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-fg-secondary uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${accentStyles[accentColor] || accentStyles.emerald}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl lg:text-3xl font-bold text-fg-primary tracking-tight font-sans">
          {value}
        </span>
      </div>

      {(trend || description) && (
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md ${
                isPositive
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {trend}
            </span>
          )}
          <span className="text-fg-muted font-normal">
            {description || trendLabel}
          </span>
        </div>
      )}
    </div>
  )
}
