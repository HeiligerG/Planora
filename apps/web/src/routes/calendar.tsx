import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  useStudySessions,
  useCreateSession,
  useDeleteSession,
  useStartSession,
  useCompleteSession,
} from '../hooks/useStudySessions'
import WeekHeader from '../components/calendar/WeekHeader'
import DayColumn from '../components/calendar/DayColumn'
import SessionModal, { SessionForm } from '../components/calendar/SessionModal'
import BulkPlanWizard from '../modals/BulkPlanWizard'
import { StudySession } from '../types/study-session'
import { startOfWeekISO, endOfWeekISO, weekLabel, dayIndex, minutesBetween } from '../utils/date'

export const Route = createFileRoute('/calendar')({
  component: CalendarPage,
})

function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editing, setEditing] = useState<StudySession | null>(null)

  // --- Selection state ---
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const startISO = startOfWeekISO(weekOffset)
  const endISO = endOfWeekISO(startISO)
  const label = weekLabel(startISO)

  const { data: sessions, isLoading, error } = useStudySessions(startISO, endISO)
  const createSession = useCreateSession()
  const deleteSession = useDeleteSession()
  const startSession = useStartSession()
  const completeSession = useCompleteSession()

  const sessionsByDay = useMemo(() => {
    const days: StudySession[][] = Array.from({ length: 7 }, () => [])
    ;(sessions ?? []).forEach((s) => {
      const idx = dayIndex(startISO, s.scheduledStart)
      if (idx >= 0 && idx < 7) days[idx].push(s)
    })
    return days
  }, [sessions, startISO])

  const capacityByDay = useMemo(
    () =>
      sessionsByDay.map((dayList) => {
        const used = dayList.reduce(
          (sum, s) => sum + minutesBetween(s.scheduledStart, s.scheduledEnd),
          0,
        )
        const total = 120
        return { used, total }
      }),
    [sessionsByDay],
  )

  // ---------- Selection Handlers ----------
  function enterSelection() {
    setSelectionMode(true)
  }
  function exitSelection() {
    setSelectionMode(false)
    setSelectedIds(new Set()) // neues Set → sauberer Reset
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function deleteSelected(ids?: string[]) {
    const toDelete = ids ?? Array.from(selectedIds)
    if (!toDelete.length) return
    if (!confirm(`${toDelete.length} Session(s) löschen?`)) return
    // nacheinander reicht hier (keine Bulk-API nötig)
    for (const id of toDelete) {
      await deleteSession.mutateAsync(id)
    }
    setSelectedIds(prev => {
      const next = new Set(prev)
      toDelete.forEach(id => next.delete(id))
      return next
    })
  }

  function handleStart(s: StudySession) {
    startSession.mutate(s.id)
  }

  function handleComplete(s: StudySession) {
    completeSession.mutate(s.id)
  }

  // ---------- CRUD ----------
  function openCreate() { setEditing(null); setShowCreateModal(true) }
  function openEdit(s: StudySession) { setEditing(s); setShowCreateModal(true) }

  async function handleCreateSubmit(v: SessionForm) {
    await createSession.mutateAsync({
      title: v.title,
      scheduledStart: new Date(v.start).toISOString(),
      scheduledEnd: new Date(v.end).toISOString(),
      notes: v.notes,
    })
    setShowCreateModal(false)
  }

  async function handleDelete(id: string) {
    if (confirm('Session löschen?')) await deleteSession.mutateAsync(id)
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
      Fehler beim Laden: {(error as Error).message}
    </div>
  }

  const totalSelected = selectedIds.size

  return (
    <div className="space-y-4">
      <WeekHeader
        label={label}
        onPrev={() => setWeekOffset(w => w - 1)}
        onToday={() => setWeekOffset(0)}
        onNext={() => setWeekOffset(w => w + 1)}
        onCreate={openCreate}
        onBulk={() => setShowBulkModal(true)}
        creating={createSession.isPending}
      />

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Lade Sessions…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-7">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((colLabel, i) => (
            <DayColumn
              key={colLabel}
              label={colLabel}
              sessions={sessionsByDay[i]}
              capacity={capacityByDay[i]}
              // selection
              selectionMode={selectionMode}
              selectedIds={selectedIds}
              onEnterSelection={enterSelection}
              onToggleSelect={toggleSelect}
              onDeleteSelected={(ids) => deleteSelected(ids)}
              // single actions
              onDelete={handleDelete}
              onEdit={openEdit}
              onStart={handleStart as any}
              onComplete={handleComplete as any}
            />
          ))}
        </div>
      )}

      {/* Global selection footer */}
      {selectionMode && (
        <div className="sticky bottom-2 z-10 mx-1 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
          <span className="text-sm text-slate-600">{totalSelected} ausgewählt</span>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
              onClick={exitSelection}
            >
              Selektionsmodus beenden
            </button>
            <button
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-700 hover:bg-rose-100 disabled:opacity-50"
              onClick={() => deleteSelected()}
              disabled={totalSelected === 0}
            >
              Ausgewählte löschen
            </button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <SessionModal
          initial={editing ?? undefined}
          onClose={() => { setShowCreateModal(false); setEditing(null) }}
          onSubmit={handleCreateSubmit}
          saving={createSession.isPending}
        />
      )}

      {showBulkModal && (
        <BulkPlanWizard
          onClose={() => setShowBulkModal(false)}
          defaultWindow={{ fromISO: startISO, toISO: endISO }}
        />
      )}
    </div>
  )
}