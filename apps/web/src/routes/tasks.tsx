import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/tasks')({
  component: TasksPage,
})

/** ------------------------- Types & Mock Data ------------------------- */
type Priority = 'low' | 'medium' | 'high'
type Status = 'open' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  subject: string
  effortMinutes: number
  due: string // ISO date
  priority: Priority
  tags: string[]
  status: Status
}

const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Funktionen Zusammenfassung',
    subject: 'Mathe',
    effortMinutes: 90,
    due: addDaysISO(2),
    priority: 'high',
    tags: ['#Zusammenfassung', '#Üben'],
    status: 'open',
  },
  {
    id: 't2',
    title: 'Vokabel-Set A',
    subject: 'Englisch',
    effortMinutes: 30,
    due: addDaysISO(1),
    priority: 'medium',
    tags: ['#Vokabeln'],
    status: 'in_progress',
  },
  {
    id: 't3',
    title: 'WWI Kapitel lesen',
    subject: 'Geschichte',
    effortMinutes: 45,
    due: addDaysISO(5),
    priority: 'low',
    tags: ['#Lesen'],
    status: 'done',
  },
]

/** ------------------------------ Page ------------------------------ */
function TasksPage() {
  // Local "mock backend" state
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all')
  const [sortBy, setSortBy] = useState<'due' | 'priority' | 'effort' | 'title'>('due')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = tasks.filter(t => {
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
      const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter
      return matchesQuery && matchesStatus
    })

    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortBy === 'due') {
        cmp = new Date(a.due).getTime() - new Date(b.due).getTime()
      } else if (sortBy === 'priority') {
        const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
        cmp = order[a.priority] - order[b.priority]
      } else if (sortBy === 'effort') {
        cmp = a.effortMinutes - b.effortMinutes
      } else if (sortBy === 'title') {
        cmp = a.title.localeCompare(b.title, 'de')
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [tasks, query, statusFilter, sortBy, sortDir])

  function handleCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function handleEdit(task: Task) {
    setEditing(task)
    setModalOpen(true)
  }

  function handleDelete(id: string) {
    if (confirm('Diese Aufgabe wirklich löschen?')) {
      setTasks(prev => prev.filter(t => t.id !== id))
    }
  }

  function handleSubmit(input: TaskFormValues) {
    if (editing) {
      setTasks(prev =>
        prev.map(t => (t.id === editing.id ? { ...editing, ...input, id: editing.id } : t)),
      )
    } else {
      const newTask: Task = { id: cryptoRandomId(), ...input }
      setTasks(prev => [newTask, ...prev])
    }
    setModalOpen(false)
    setEditing(null)
  }

  function handleStatusChange(id: string, status: Status) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status } : t)))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Aufgaben</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suchen… (#Tag, Titel, Fach)"
              className="w-64 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">Alle Status</option>
              <option value="open">Offen</option>
              <option value="in_progress">In Arbeit</option>
              <option value="done">Erledigt</option>
            </select>
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

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <Th>Titel</Th>
              <Th>Fach</Th>
              <Th>Aufwand</Th>
              <Th>Deadline</Th>
              <Th>Prio</Th>
              <Th>Tags</Th>
              <Th>Status</Th>
              <Th className="text-right">Aktionen</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-400">
                  Keine Aufgaben gefunden
                </td>
              </tr>
            )}
            {filtered.map(task => (
              <tr key={task.id} className="border-t border-slate-100">
                <Td className="font-medium">{task.title}</Td>
                <Td>{task.subject}</Td>
                <Td>{task.effortMinutes} min</Td>
                <Td>{formatDate(task.due)}</Td>
                <Td><PriorityBadge p={task.priority} /></Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {task.tags.map(t => <TagChip key={t}>{t}</TagChip>)}
                  </div>
                </Td>
                <Td>
                  <StatusSelect
                    value={task.status}
                    onChange={(v) => handleStatusChange(task.id, v)}
                  />
                </Td>
                <Td className="text-right">
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => handleEdit(task)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700 hover:bg-rose-100"
                    >
                      Löschen
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <TaskModal
          initial={editing ?? undefined}
          onClose={() => { setModalOpen(false); setEditing(null) }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

/** --------------------------- Small Components --------------------------- */

function SortControl(props: {
  sortBy: 'due' | 'priority' | 'effort' | 'title'
  sortDir: 'asc' | 'desc'
  onChange: (by: 'due' | 'priority' | 'effort' | 'title', dir: 'asc' | 'desc') => void
}) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={props.sortBy}
        onChange={(e) => props.onChange(e.target.value as any, props.sortDir)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
      >
        <option value="due">Deadline</option>
        <option value="priority">Prio</option>
        <option value="effort">Aufwand</option>
        <option value="title">Titel</option>
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

function PriorityBadge({ p }: { p: Priority }) {
  const map: Record<Priority, string> = {
    high: 'bg-rose-100 text-rose-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-emerald-100 text-emerald-800',
  }
  const label: Record<Priority, string> = { high: 'hoch', medium: 'mittel', low: 'niedrig' }
  return <span className={`rounded-full px-2 py-0.5 text-xs ${map[p]}`}>{label[p]}</span>
}

function StatusSelect({ value, onChange }: { value: Status; onChange: (v: Status) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Status)}
      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
    >
      <option value="open">offen</option>
      <option value="in_progress">in Arbeit</option>
      <option value="done">erledigt</option>
    </select>
  )
}

function TagChip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">{children}</span>
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${className}`}>{children}</th>
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 align-top ${className}`}>{children}</td>
}

/** ------------------------------- Modal ------------------------------- */

type TaskFormValues = Omit<Task, 'id'>

function TaskModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial?: Task
  onClose: () => void
  onSubmit: (values: TaskFormValues) => void
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [subject, setSubject] = useState(initial?.subject ?? '')
  const [effortMinutes, setEffortMinutes] = useState(initial?.effortMinutes ?? 60)
  const [due, setDue] = useState(toInputDate(initial?.due ?? addDaysISO(2)))
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium')
  const [tags, setTags] = useState(initial?.tags.join(' ') ?? '')
  const [status, setStatus] = useState<Status>(initial?.status ?? 'open')

  function submit() {
    const values: TaskFormValues = {
      title: title.trim(),
      subject: subject.trim(),
      effortMinutes: Number(effortMinutes) || 0,
      due: new Date(due).toISOString(),
      priority,
      tags: splitTags(tags),
      status,
    }
    onSubmit(values)
  }

  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-black/20 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">{initial ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}</div>
          <button className="text-xs text-slate-500" onClick={onClose}>Schließen</button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Labeled label="Titel" className="sm:col-span-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
          </Labeled>
          <Labeled label="Fach">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
          </Labeled>
          <Labeled label="Aufwand (min)">
            <input
              type="number"
              min={0}
              value={effortMinutes}
              onChange={(e) => setEffortMinutes(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </Labeled>
          <Labeled label="Deadline">
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </Labeled>
          <Labeled label="Prio">
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="high">hoch</option>
              <option value="medium">mittel</option>
              <option value="low">niedrig</option>
            </select>
          </Labeled>
          <Labeled label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="open">offen</option>
              <option value="in_progress">in Arbeit</option>
              <option value="done">erledigt</option>
            </select>
          </Labeled>
          <Labeled label="Tags (mit Leerzeichen, z. B. #Üben #Vokabeln)" className="sm:col-span-2">
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
          </Labeled>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50">
            Abbrechen
          </button>
          <button onClick={submit} className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white">
            Speichern
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

/** ------------------------------ Utils ------------------------------ */
function addDaysISO(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function toInputDate(iso: string) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })
}

function splitTags(s: string) {
  return s
    .split(/\s+/)
    .map(t => t.trim())
    .filter(Boolean)
}

function cryptoRandomId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as any).randomUUID()
  }
  return Math.random().toString(36).slice(2, 10)
}