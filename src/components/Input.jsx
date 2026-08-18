import { forwardRef } from 'react'

export const Input = forwardRef(function Input(
  {
    label,
    id,
    error,
    helperText,
    leftIcon = null,
    rightIcon = null,
    shortcut = null,
    className = '',
    required = false,
    ...props
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-400 ml-1">*</span>}
          </span>
          {shortcut && (
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
              {shortcut}
            </kbd>
          )}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-zinc-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full h-11 px-3.5 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500
            bg-zinc-900/90 border border-zinc-700/60
            focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none
            transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || shortcut ? 'pr-10' : ''}
            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 flex items-center text-zinc-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-400 font-medium mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-zinc-400 mt-1">{helperText}</p>}
    </div>
  )
})

export const Textarea = forwardRef(function Textarea(
  {
    label,
    id,
    error,
    helperText,
    className = '',
    rows = 4,
    required = false,
    ...props
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-bold text-zinc-300 uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={`
          w-full px-3.5 py-2.5 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500
          bg-zinc-900/90 border border-zinc-700/60
          focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none
          transition-all duration-150 resize-y
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}
        `}
        {...props}
      />
      {error && <p className="text-xs text-rose-400 font-medium mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-zinc-400 mt-1">{helperText}</p>}
    </div>
  )
})

export const Select = forwardRef(function Select(
  {
    label,
    id,
    options = [],
    error,
    helperText,
    className = '',
    required = false,
    leftIcon = null,
    ...props
  },
  ref
) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-bold text-zinc-300 uppercase tracking-wider"
        >
          {label}
          {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-zinc-400">
            {leftIcon}
          </div>
        )}
        <select
          ref={ref}
          id={id}
          className={`
            w-full h-11 px-3.5 pr-10 rounded-xl text-sm text-zinc-100
            bg-zinc-900/90 border border-zinc-700/60
            focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none
            transition-all duration-150 appearance-none cursor-pointer
            ${leftIcon ? 'pl-10' : ''}
            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}
          `}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-zinc-900 text-zinc-100 py-2">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 pointer-events-none text-zinc-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-rose-400 font-medium mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-zinc-400 mt-1">{helperText}</p>}
    </div>
  )
})
