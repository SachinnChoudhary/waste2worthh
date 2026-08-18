export function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-earth-800">
          {label}
        </label>
      )}
      <input
        id={id}
        className="w-full px-3.5 py-2.5 rounded-lg border border-sage-200 bg-white text-bark placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-forest-400 transition-colors text-sm"
        {...props}
      />
      {error && <p className="text-xs text-terra-500">{error}</p>}
    </div>
  )
}

export function Textarea({ label, id, error, className = '', rows = 4, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-earth-800">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className="w-full px-3.5 py-2.5 rounded-lg border border-sage-200 bg-white text-bark placeholder:text-earth-300 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-forest-400 transition-colors text-sm resize-y"
        {...props}
      />
      {error && <p className="text-xs text-terra-500">{error}</p>}
    </div>
  )
}

export function Select({ label, id, options = [], className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-earth-800">
          {label}
        </label>
      )}
      <select
        id={id}
        className="w-full px-3.5 py-2.5 rounded-lg border border-sage-200 bg-white text-bark focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-forest-400 transition-colors text-sm"
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
