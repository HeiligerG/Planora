import { useMemo, useState } from 'react'
import CapacityEditor from './CapacityEditor'
import SessionCard from './SessionCard'
import { StudySession } from '../../types/study-session'
import { minutesBetween } from '../../utils/date'

export default function DayColumn({
  label,
  sessions,
  capacity,
  selectionMode,
  selectedIds,
  onEnterSelection,
  onToggleSelect,
  onDeleteSelected,
  onDelete,
  onEdit,
  onUpdateCapacity,
  onStart,
  onComplete,
}: {
  label: string
  sessions: StudySession[]
  capacity: { used: number; total: number }
  selectionMode?: boolean
  selectedIds?: Set<string>
  onEnterSelection?: () => void
  onToggleSelect?: (id: string) => void
  onDeleteSelected?: (ids: string[]) => void
  onDelete: (id: string) => void
  onEdit: (s: StudySession) => void
  onUpdateCapacity?: (minutes: number) => void
  onStart?: (s: StudySession) => void
  onComplete?: (s: StudySession) => void
}) {
  const [capOpen, setCapOpen] = useState(false)

  const sorted = useMemo(
    () => [...sessions].sort((a, b) => +new Date(a.scheduledStart) - +new Date(b.scheduledStart)),
    [sessions]
  )

  const used = useMemo(
    () => sorted.reduce((sum, s) => sum + minutesBetween(s.scheduledStart, s.scheduledEnd), 0),
    [sorted]
  )

  const total = capacity.total || 0
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
  const over = used > total

  const selectedCount = selectedIds ? sorted.filter(s => selectedIds.has(s.id)).length : 0

  const isToday = (() => {
    const idx = ['Mo','Di','Mi','Do','Fr','Sa','So'].indexOf(label)
    const now = new Date()
    const dow = ((now.getDay() + 6) % 7)
    return idx === dow
  })()

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      {/* Kapazität oben */}
      <div className="mb-2 flex items-center gap-2">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full transition-all ${over ? 'bg-rose-500' : 'bg-slate-400'}`} style={{ width: `${pct}%` }} />
        </div>
        <button
          className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50"
          onClick={() => setCapOpen(o => !o)}
        >
          {used}/{total} min
        </button>
        {capOpen && (
          <CapacityEditor
            initial={total}
            onSave={(m) => { onUpdateCapacity?.(m); setCapOpen(false) }}
            onClose={() => setCapOpen(false)}
          />
        )}
      </div>

      {/* Kopfzeile */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{label}</span>
          {isToday && (
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] text-white">Heute</span>
          )}
        </div>

        {/* Auswahl-Button bleibt – ohne Popover */}
        {!selectionMode ? (
          <button
            onClick={() => onEnterSelection?.()}
            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-50"
          >
            Auswahl
          </button>
        ) : (
          <span
            className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600"
            title="Anzahl ausgewählter Sessions in dieser Spalte"
          >
            {selectedCount}/{sorted.length}
          </span>
        )}
      </div>

      {/* Inhalt */}
      {sorted.length === 0 ? (
        <div className="grid h-[136px] place-items-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
          Frei
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map(s => (
            <SessionCard
              key={s.id}
              s={s}
              selectable={!!selectionMode}
              selected={!!selectedIds?.has(s.id)}
              onToggleSelect={onToggleSelect}
              onDelete={onDelete}
              onEdit={onEdit}
              onStart={(ss) => onStart?.(ss)} 
              onComplete={(ss) => onComplete?.(ss)}
            />
          ))}
        </div>
      )}
    </div>
  )
}