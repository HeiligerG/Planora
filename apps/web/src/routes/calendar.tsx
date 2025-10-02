import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useStudySessions, useCreateSession, useDeleteSession } from '../hooks/useStudySessions'

export const Route = createFileRoute('/calendar')({
  component: CalendarPage,
})

function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const { startISO, endISO, label } = useWeekRange(weekOffset)

  const { data: sessions, isLoading, error } = useStudySessions(startISO, endISO)
  const createSession = useCreateSession()
  const deleteSession = useDeleteSession()

  const sessionsByDay = useMemo(() => {
    const days: Array<any[]> = Array.from({ length: 7 }, () => [])
    ;(sessions ?? []).forEach(s => {
      const idx = dayIndex(startISO, s.scheduledStart)
      if (idx >= 0 && idx < 7) days[idx].push(s)
    })
    return days
  }, [sessions, startISO])

  const capacityByDay = useMemo(() => {
    return sessionsByDay.map((arr) => {
      const used = arr.reduce((sum, s) => {
        const m = Math.max(0, (new Date(s.scheduledEnd).getTime() - new Date(s.scheduledStart).getTime()) / 60000)
        return sum + Math.round(m)
      }, 0)
      const total = 120 // später durch CapacityRule ersetzen
      return { used, total }
    })
  }, [sessionsByDay])

  function openQuickAdd() {
    const now = new Date()
    const start = toInputDateTime(now)
    const end = toInputDateTime(new Date(now.getTime() + 45 * 60000))
    const title = prompt('Session-Titel (z. B. Mathe: Üben)', 'Lerneinheit')
    if (!title) return
    createSession.mutate({
      title,
      scheduledStart: new Date(start).toISOString(),
      scheduledEnd: new Date(end).toISOString(),
    })
  }

  function removeSession(id: string) {
    if (confirm('Session löschen?')) deleteSession.mutate(id)
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
      Fehler beim Laden: {(error as Error).message}
    </div>
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{label}</h2>
        <div className="flex gap-2">
          <button onClick={() => setWeekOffset(w => w - 1)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm">← Vorherige</button>
          <button onClick={() => setWeekOffset(0)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm">Heute</button>
          <button onClick={() => setWeekOffset(w => w + 1)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm">Nächste →</button>
          <button onClick={openQuickAdd} className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-60" disabled={createSession.isPending}>
            + Session
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Lade Sessions…
        </div>
      )}

      {/* Week grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-7">
          {['Mo','Di','Mi','Do','Fr','Sa','So'].map((d, i) => (
            <DayColumn
              key={d}
              day={d}
              sessions={sessionsByDay[i]}
              capacity={capacityByDay[i]}
              onDelete={removeSession}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DayColumn({ day, sessions, capacity, onDelete }: {
  day: string
  sessions: any[]
  capacity: { used: number; total: number }
  onDelete: (id: string) => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium text-slate-700">{day}</span>
        <CapacityIndicator used={capacity.used} total={capacity.total} />
      </div>

      <div className="space-y-2">
        {sessions.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400">Frei</div>
        ) : (
          sessions
            .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
            .map(s => <SessionCard key={s.id} session={s} onDelete={onDelete} />)
        )}
      </div>
    </div>
  )
}

function SessionCard({ session, onDelete }: { session: any; onDelete: (id: string) => void }) {
  const isDone = session.actualStart && session.actualEnd
  const minutes = Math.round((new Date(session.scheduledEnd).getTime() - new Date(session.scheduledStart).getTime()) / 60000)

  return (
    <div className={`rounded-xl border p-2.5 text-xs ${isDone ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`font-medium ${isDone ? 'text-emerald-900' : 'text-slate-700'}`}>{session.title}</div>
          <div className={`mt-0.5 ${isDone ? 'text-emerald-600' : 'text-slate-500'}`}>
            {timeRange(session.scheduledStart, session.scheduledEnd)} · {minutes} min
          </div>
          {!!session.subtasks?.length && (
            <div className="mt-1 text-[10px] text-slate-500">
              {session.subtasks.filter((st: any) => st.completed).length}/{session.subtasks.length} Subtasks
            </div>
          )}
        </div>
        <div className="ml-2 flex gap-1">
          <button onClick={() => onDelete(session.id)} className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] text-rose-700">Löschen</button>
        </div>
      </div>
    </div>
  )
}

function CapacityIndicator({ used, total }: { used: number; total: number }) {
  const percentage = total === 0 ? 0 : Math.round((used / total) * 100)
  const isOver = used > total
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${isOver ? 'bg-rose-500' : 'bg-slate-400'}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
      <span className={`text-[10px] ${isOver ? 'text-rose-600' : 'text-slate-500'}`}>{used}/{total}</span>
    </div>
  )
}

/* --------- kleine Utils für die Woche --------- */
function useWeekRange(offset: number) {
  const now = new Date()
  const dow = (now.getDay() + 6) % 7 // Mo=0
  const monday = new Date(now)
  monday.setDate(now.getDate() - dow + offset * 7)
  monday.setHours(0, 0, 0, 0)
  const sundayEnd = new Date(monday)
  sundayEnd.setDate(monday.getDate() + 7)
  sundayEnd.setHours(23, 59, 59, 999)
  const startISO = monday.toISOString()
  const endISO = sundayEnd.toISOString()
  const weekNumber = getWeekNumber(monday)
  return { startISO, endISO, label: `Woche ${weekNumber}` }
}
function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = (date.getUTCDay() + 6) % 7
  date.setUTCDate(date.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(),0,4))
  const diff = date.valueOf() - firstThursday.valueOf()
  return 1 + Math.round(diff / (7 * 24 * 3600 * 1000))
}
function dayIndex(weekStartISO: string, iso: string) {
  const a = new Date(weekStartISO).getTime()
  const b = new Date(iso).getTime()
  return Math.floor((b - a) / (24 * 3600 * 1000))
}
function toInputDateTime(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2,'0')
  const day = String(d.getDate()).padStart(2,'0')
  const hh = String(d.getHours()).padStart(2,'0')
  const mm = String(d.getMinutes()).padStart(2,'0')
  return `${y}-${m}-${day}T${hh}:${mm}`
}
function timeRange(a: string, b: string) {
  const s = new Date(a).toLocaleTimeString('de-CH',{ hour:'2-digit', minute:'2-digit' })
  const e = new Date(b).toLocaleTimeString('de-CH',{ hour:'2-digit', minute:'2-digit' })
  return `${s}–${e}`
}