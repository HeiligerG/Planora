import { ReactNode } from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  headerAction?: ReactNode
}

export function Card({ title, subtitle, children, className = '', headerAction }: CardProps) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="mb-3 flex items-center justify-between">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-700">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}