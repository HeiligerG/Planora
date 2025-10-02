import { useEffect, useState } from 'react'
import { toInputDateTime } from '../../utils/date'
import { StudySession } from '../../types/study-session'

export type SessionForm = {
  title: string
  start: string
  end: string
  notes?: string
}

export default function SessionModal({
  initial,
  onClose,
  onSubmit,
  saving,
}: {
  initial?: StudySession
  onClose: () => void
  onSubmit: (v: SessionForm) => void
  saving?: boolean
}) {
  const now = new Date()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [start, setStart] = useState(
    initial ? toInputDateTime(new Date(initial.scheduledStart)) : toInputDateTime(now),
  )
  const [end, setEnd] = useState(
    initial
      ? toInputDateTime(new Date(initial.scheduledEnd))
      : toInputDateTime(new Date(now.getTime() + 45 * 60000)),
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')

  useEffect(() => {
    if (new Date(start).getTime() > new Date(end).getTime()) {
      const tmp = new Date(start)
      tmp.setMinutes(tmp.getMinutes() + 30)
      setEnd(toInputDateTime(tmp))
    }
  }, [start])

  function submit() {
    if (!title.trim()) return alert('Bitte Titel angeben.')
    onSubmit({ title: title.trim(), start, end, notes: notes.trim() || undefined })
  }

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">{initial ? 'Session bearbeiten' : 'Neue Session'}</div>
          <button className="text-xs text-slate-500" onClick={onClose} disabled={saving}>
            Schließen
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Labeled label="Titel" className="sm:col-span-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </Labeled>
          <Labeled label="Start">
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </Labeled>
          <Labeled label="Ende">
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </Labeled>
          <Labeled label="Notizen" className="sm:col-span-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
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

function Labeled({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`space-y-1 ${className}`}>
      <div className="text-xs font-medium text-slate-600">{label}</div>
      {children}
    </label>
  )
}