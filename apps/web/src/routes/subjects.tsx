import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  useSubjects,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
  SubjectUI,
} from '../hooks/useSubjects'

export const Route = createFileRoute('/subjects')({
  component: SubjectsPage,
})

function SubjectsPage() {
  const { data, isLoading, error } = useSubjects()
  const createSubject = useCreateSubject()
  const updateSubject = useUpdateSubject()
  const deleteSubject = useDeleteSubject()

  const subjects = data ?? []

  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'goal' | 'progress'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<SubjectUI | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = subjects.filter(s => !q || s.name.toLowerCase().includes(q))

    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name, 'de')
      if (sortBy === 'goal') cmp = a.weeklyGoalMinutes - b.weeklyGoalMinutes
      if (sortBy === 'progress') cmp = progress(a) - progress(b)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [subjects, query, sortBy, sortDir])

  function handleCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function handleEdit(s: SubjectUI) {
    setEditing(s)
    setModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (confirm('Dieses Fach wirklich löschen?')) {
      await deleteSubject.mutateAsync(id)
    }
  }

  async function handleSubmit(values: SubjectFormValues) {
    if (editing) {
      await updateSubject.mutateAsync({
        id: editing.id,
        patch: {
          name: values.name,
          weeklyGoalMinutes: values.weeklyGoalMinutes,
          color: values.color ?? undefined,
        },
      })
    } else {
      await createSubject.mutateAsync({
        name: values.name,
        weeklyGoalMinutes: values.weeklyGoalMinutes,
        color: values.color ?? null,
      })
    }
    setEditing(null)
    setModalOpen(false)
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
        Fehler beim Laden der Fächer: {(error as Error).message}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Fächer</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suchen… (z. B. Mathe)"
              className="w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
            <SortControl
              sortBy={sortBy}
              sortDir={sortDir}
              onChange={(by, dir) => { setSortBy(by); setSortDir(dir) }}
            />
          </div>
          <button
            onClick={handleCreate}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white"
          >
            + Neu
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Lade Fächer…
        </div>
      )}

      {/* Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 md:col-span-2 xl:col-span-3">
              Keine Fächer gefunden
            </div>
          )}
          {filtered.map(s => (
            <SubjectCard
              key={s.id}
              subject={s}
              onEdit={() => handleEdit(s)}
              onDelete={() => handleDelete(s.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <SubjectModal
          initial={editing ?? undefined}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          onSubmit={handleSubmit}
          saving={createSubject.isPending || updateSubject.isPending}
        />
      )}
    </div>
  )
}

/* ======================== Components (UI) ======================== */

function SubjectCard({
  subject,
  onEdit,
  onDelete,
}: {
  subject: SubjectUI
  onEdit: () => void
  onDelete: () => void
}) {
  const completedThisWeek = 0
  const pct = Math.min(100, Math.round(progress({ ...subject, completedThisWeek } as any)))
  const remaining = Math.max(0, subject.weeklyGoalMinutes - completedThisWeek)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">{subject.name}</div>
          <div className="text-xs text-slate-500">
            Ziel: {subject.weeklyGoalMinutes} min/Woche
          </div>
        </div>
        <div
          className="h-10 w-10 rounded-xl"
          style={{ backgroundColor: subject.color ?? '#e2e8f0', opacity: 0.3 }}
          title="Farbe (optional)"
        />
      </div>

      <div className="mb-1 text-xs text-slate-500">Erledigung (Woche)</div>
      <ProgressBar value={pct} />

      <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
        <span>Erledigt: {completedThisWeek} min</span>
        <span>Rest: {remaining} min</span>
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={onEdit} className="rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50">
          Bearbeiten
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100"
        >
          Löschen
        </button>
      </div>
    </div>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-slate-300" style={{ width: `${value}%` }} />
    </div>
  )
}

function SortControl(props: {
  sortBy: 'name' | 'goal' | 'progress'
  sortDir: 'asc' | 'desc'
  onChange: (by: 'name' | 'goal' | 'progress', dir: 'asc' | 'desc') => void
}) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={props.sortBy}
        onChange={(e) => props.onChange(e.target.value as any, props.sortDir)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
      >
        <option value="name">Name</option>
        <option value="goal">Ziel (min/Woche)</option>
        <option value="progress">Fortschritt (%)</option>
      </select>
      <button
        onClick={() => props.onChange(props.sortBy, props.sortDir === 'asc' ? 'desc' : 'asc')}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
        title="Sortierreihenfolge umschalten"
      >
        {props.sortDir === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  )
}

/* ========================= Modal & Form ========================= */

type SubjectFormValues = {
  name: string
  weeklyGoalMinutes: number
  color?: string
  completedThisWeek?: number
}

function SubjectModal({
  initial,
  onClose,
  onSubmit,
  saving,
}: {
  initial?: SubjectUI
  onClose: () => void
  onSubmit: (values: SubjectFormValues) => void
  saving?: boolean
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(initial?.weeklyGoalMinutes ?? 120)
  const [color, setColor] = useState<string>(initial?.color ?? '#64748b')
  const [completedThisWeek, setCompletedThisWeek] = useState(0)

  function submit() {
    onSubmit({
      name: name.trim(),
      weeklyGoalMinutes: Math.max(0, Number(weeklyGoalMinutes) || 0),
      color,
      completedThisWeek: Math.max(0, Number(completedThisWeek) || 0),
    })
  }

  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-black/20 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">{initial ? 'Fach bearbeiten' : 'Neues Fach'}</div>
          <button className="text-xs text-slate-500" onClick={onClose}>Schließen</button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Labeled label="Name" className="sm:col-span-2">
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
          </Labeled>
          <Labeled label="Ziel (min/Woche)">
            <input
              type="number"
              min={0}
              value={weeklyGoalMinutes}
              onChange={(e) => setWeeklyGoalMinutes(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </Labeled>
          <Labeled label="Farbe">
            <input
              type="color"
              value={color ?? '#64748b'}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white p-1"
            />
          </Labeled>

          {/* Nur UI-Preview – später durch Analytics ersetzen */}
          <Labeled label="Erledigt (diese Woche)">
            <input
              type="number"
              min={0}
              value={completedThisWeek}
              onChange={(e) => setCompletedThisWeek(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </Labeled>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
            disabled={saving}
          >
            Abbrechen
          </button>
          <button
            onClick={submit}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Labeled({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`space-y-1 ${className}`}>
      <div className="text-xs font-medium text-slate-600">{label}</div>
      {children}
    </label>
  )
}

function progress(s: SubjectUI & { completedThisWeek?: number }) {
  const done = s.completedThisWeek ?? 0
  if (s.weeklyGoalMinutes <= 0) return 0
  return (done / s.weeklyGoalMinutes) * 100
}