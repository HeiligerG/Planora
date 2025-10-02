export default function CapacityIndicator({
  used,
  total,
}: {
  used: number
  total: number
}) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
  const over = used > total

  return (
    <div className="flex items-center gap-2 text-[11px]">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div
          className={[
            'h-full transition-[width]',
            over ? 'bg-rose-500' : 'bg-slate-400',
          ].join(' ')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={over ? 'text-rose-600' : 'text-slate-500'}>
        {used}/{total}
      </span>
    </div>
  )
}