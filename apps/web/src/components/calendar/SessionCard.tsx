// components/calendar/SessionCard.tsx
import { useMemo } from 'react'
import { StudySession } from '../../types/study-session'
import { fmtTimeRange, minutesBetween } from '../../utils/date'
import { EditIcon, DeleteIcon } from '../icons'

type Status = 'UPCOMING' | 'IN_PROGRESS' | 'LATE' | 'OVERDUE' | 'DONE'

export default function SessionCard({
  s, selectable, selected, onToggleSelect, onDelete, onEdit, onStart, onComplete,
}: {
  s: StudySession
  selectable?: boolean
  selected?: boolean
  onToggleSelect?: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (s: StudySession) => void
  onStart?: (s: StudySession) => void
  onComplete?: (s: StudySession) => void
}) {
  const minutes = useMemo(() => minutesBetween(s.scheduledStart, s.scheduledEnd), [s.scheduledStart, s.scheduledEnd])
  const status = computeStatus(s)

  // Farben: Orange (upcoming), Blau (in work), Cyan (zu lange), Rot (verpasst), Grün (done)
  const tone: Record<
    Status,
    { border: string; tint: string; title: string; dot: string; action: 'neutral' | 'warn' | 'danger' | 'ok' | 'info' }
  > = {
    UPCOMING:    { border: 'border-amber-300',  tint: 'bg-amber-50/70',  title: 'text-slate-800',  dot: 'bg-amber-500',  action: 'warn'   },
    IN_PROGRESS: { border: 'border-sky-300',    tint: 'bg-sky-50/70',    title: 'text-slate-800',  dot: 'bg-sky-500',    action: 'info'   },
    LATE:        { border: 'border-cyan-300',   tint: 'bg-cyan-50/70',   title: 'text-slate-800',  dot: 'bg-cyan-500',   action: 'info'   },
    OVERDUE:     { border: 'border-rose-300',   tint: 'bg-rose-50/70',   title: 'text-slate-800',  dot: 'bg-rose-500',   action: 'danger' },
    DONE:        { border: 'border-emerald-300',tint: 'bg-emerald-50/80',title: 'text-emerald-900',dot: 'bg-emerald-500',action: 'ok'     },
  }

  function openPreview() {
    if (selectable && onToggleSelect) { onToggleSelect(s.id); return }
    onEdit(s)
  }

  return (
    <div
      onClick={openPreview}
      className={[
        'group relative cursor-pointer rounded-2xl border p-3 text-xs shadow-sm transition-colors',
        tone[status].border, tone[status].tint,
        selectable && selected ? 'ring-2 ring-slate-400' : '',
        'hover:bg-white',
      ].join(' ')}
    >
      {/* Selection-Checkbox ohne Layoutsprung */}
      {selectable && (
        <input
          type="checkbox"
          checked={!!selected}
          onChange={() => onToggleSelect?.(s.id)}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-2 top-2 h-3 w-3 accent-slate-700"
        />
      )}

      {/* Kopfzeile */}
      <div className="flex items-start gap-2">
        <span className={`mt-1 inline-block h-2.5 w-2.5 flex-none rounded-full ${tone[status].dot}`} />
        <div className="min-w-0 flex-1">
          <div className={`truncate font-medium ${tone[status].title}`} title={s.title}>{s.title}</div>
          <div className="mt-1 text-slate-500">
            {fmtTimeRange(s.scheduledStart, s.scheduledEnd)} · {minutes} min
          </div>
          {!!s.subtasks?.length && (
            <div className="mt-1 text-[10px] text-slate-500">
              {s.subtasks.filter(st => st.completed).length}/{s.subtasks.length} Subtasks
            </div>
          )}
        </div>
      </div>

      {/* Toolbar – beim Hover sichtbar, schiebt nach unten */}
      <div className="mt-2 hidden items-center justify-end gap-1 group-hover:flex">
        <PrimaryAction
          status={status}
          tone={tone[status].action}
          onStart={() => onStart?.(s)}
          onComplete={() => onComplete?.(s)}
        />
        <IconButton ariaLabel="Bearbeiten" onClick={(e) => { e.stopPropagation(); onEdit(s) }}>
          <EditIcon className="h-4 w-4" />
        </IconButton>
        <IconButton ariaLabel="Löschen" variant="danger" onClick={(e) => { e.stopPropagation(); onDelete(s.id) }}>
          <DeleteIcon className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  )
}

/* -------- Status-Logik nach deiner Vorgabe -------- */
function computeStatus(s: StudySession): Status {
  const now = Date.now()
  const start = new Date(s.scheduledStart).getTime()
  const end   = new Date(s.scheduledEnd).getTime()
  const started  = !!s.actualStart
  const finished = !!s.actualEnd

  if (finished && s.actualEnd && new Date(s.actualEnd).getTime() > end) return 'LATE'
  if (finished) return 'DONE'
  if (started && now > end) return 'LATE'
  if (started) return 'IN_PROGRESS'
  if (now > end) return 'OVERDUE'
  return 'UPCOMING'
}

/* -------- Buttons -------- */
function IconButton({ children, onClick, ariaLabel, variant = 'ghost' }:{
  children: React.ReactNode; onClick: (e: React.MouseEvent) => void; ariaLabel: string; variant?: 'ghost'|'danger'
}) {
  const base = 'inline-flex items-center justify-center rounded-lg border px-2 py-1 text-[10px] transition-colors'
  const styles = variant === 'danger'
    ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
  return <button aria-label={ariaLabel} onClick={onClick} className={`${base} ${styles}`}>{children}</button>
}

function PrimaryAction({
  status, tone, onStart, onComplete,
}: { status: Status; tone: 'neutral'|'warn'|'danger'|'ok'|'info'; onStart: () => void; onComplete: () => void }) {
  const map: Record<'neutral'|'warn'|'danger'|'ok'|'info', string> = {
    neutral: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    warn:    'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
    danger:  'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
    ok:      'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    info:    'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100',
  }
  const showStart = status === 'UPCOMING' || status === 'OVERDUE'
  const showDone  = status === 'IN_PROGRESS' || status === 'LATE'
  if (!showStart && !showDone) return null

  return (
    <button
      aria-label={showStart ? 'Starten' : 'Fertig'}
      onClick={(e) => { e.stopPropagation(); showStart ? onStart() : onComplete() }}
      className={`inline-flex items-center justify-center rounded-lg border px-2 py-1 text-[10px] transition-colors ${map[tone]}`}
    >
      {showStart ? <PlayIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
    </button>
  )
}

function PlayIcon({ className='h-4 w-4' }:{className?:string}) {
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M8 5v14l11-7-11-7z"/></svg>
}
function CheckIcon({ className='h-4 w-4' }:{className?:string}) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}