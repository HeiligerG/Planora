import { ReactNode } from 'react'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon?: ReactNode
  badgeText?: string
  badgeClass?: string
  className?: string
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  badgeText,
  badgeClass = 'bg-slate-100 text-slate-800',
  className = '',
}: KpiCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') {
      return (
        <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12l7-7 7 7" />
        </svg>
      )
    }
    if (trend === 'down') {
      return (
        <svg className="h-4 w-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12l-7 7-7-7" />
        </svg>
      )
    }
    return null
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <div className="text-sm text-slate-500">{title}</div>

          {/* Value */}
          <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>

          {/* Subtitle */}
          {subtitle && <div className="mt-1 text-xs text-slate-500">{subtitle}</div>}

          {/* Trend */}
          {trend && trendValue && (
            <div className="mt-2 flex items-center gap-1">
              {getTrendIcon()}
              <span
                className={`text-xs font-medium ${
                  trend === 'up'
                    ? 'text-emerald-600'
                    : trend === 'down'
                    ? 'text-rose-600'
                    : 'text-slate-500'
                }`}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>

        {/* Icon or Badge */}
        <div className="ml-3">
          {icon && <div className="rounded-xl bg-slate-50 p-2">{icon}</div>}
          {badgeText && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
              {badgeText}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}