import { useMemo } from 'react'

interface TagLegendProps {
  className?: string
}

export function TagLegend({ className = '' }: TagLegendProps) {
  const tags = useMemo(
    () => [
      { name: '#Vokabeln', swatch: 'bg-blue-300', percentage: 25 },
      { name: '#Üben', swatch: 'bg-purple-300', percentage: 30 },
      { name: '#Lesen', swatch: 'bg-green-300', percentage: 20 },
      { name: '#Zusammenfassung', swatch: 'bg-amber-300', percentage: 15 },
      { name: '#Probeklausur', swatch: 'bg-rose-300', percentage: 10 },
    ],
    []
  )

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-3 ${className}`}>
      <div className="mb-2 text-xs font-semibold text-slate-700">Tag-Legende</div>
      <div className="space-y-1">
        {tags.map((tag) => (
          <div key={tag.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded ${tag.swatch}`} />
              <span className="text-slate-600">{tag.name}</span>
            </div>
            <span className="text-slate-400">{tag.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}