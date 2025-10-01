import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useExams, useCreateExam, useDeleteExam } from '../hooks/useExams'
import { useSubjects } from '../hooks/useSubjects'
import type { Exam as ExamApi } from '../lib/api'

export const Route = createFileRoute('/exams')({
  component: ExamsPage,
})

/* ============================ Page ============================ */

function ExamsPage() {
  const { data: exams, isLoading, error } = useExams()
  const createExam = useCreateExam()
  const deleteExam = useDeleteExam()
  const { data: subjects } = useSubjects()

  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = (exams ?? [])
      .filter(e => !q || e.title.toLowerCase().includes(q) || e.subject.name.toLowerCase().includes(q))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return list
  }, [exams, query])

  const selected = useMemo(() => {
    if (!filtered.length) return undefined
    if (selectedId) return filtered.find(e => e.id === selectedId) ?? filtered[0]
    return filtered[0]
  }, [filtered, selectedId])

  function openCreate() {
    setModalOpen(true)
  }

  async function handleCreate(values: ExamFormValues) {
    await createExam.mutateAsync({
      title: values.title.trim(),
      date: new Date(values.date).toISOString(),
      subjectId: values.subjectId,
      duration: values.duration ?? undefined,
      location: values.location?.trim() || undefined,
      description: values.description?.trim() || undefined,
      prepTimeNeeded: values.prepTimeNeeded ?? undefined,
      risk: values.risk,
    })
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (confirm('Diese Prüfung wirklich löschen?')) {
      await deleteExam.mutateAsync(id)
      if (selectedId === id) setSelectedId(undefined)
    }
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
        Fehler beim Laden der Prüfungen: {(error as Error).message}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Liste */}
      <aside className="col-span-12 md:col-span-4 xl:col-span-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-700">Prüfungen</div>
            <div className="text-xs text-slate-400">Wireframe</div>
          </div>

          <div className="mb-2 flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suchen…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={openCreate}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60"
              disabled={isLoading}
              title="Neue Prüfung"
            >
              + Neu
            </button>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              Lade Prüfungen…
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(e => (
                <button
                  key={e.id}
                  onClick={() => setSelectedId(e.id)}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                    selected?.id === e.id ? 'border-slate-300 bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{e.title}</div>
                    <RiskBadge risk={riskNumberToUi(e.risk)} />
                  </div>
                  <div className="text-xs text-slate-500">
                    {weekdayShort(e.date)}, {formatDate(e.date)}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                  Keine Prüfungen gefunden
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Detail */}
      <main className="col-span-12 md:col-span-8 xl:col-span-9 space-y-4">
        {selected && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold">
                  {selected.title} — {selected.subject.name}
                </div>
                <div className="text-xs text-slate-400">Wireframe</div>
              </div>

              {/* Placeholder-Plan; echte Phasen/Restaufwand via Analytics später */}
              <PlanTimeline phases={['Sichten', 'Üben', 'Probeklausur', 'Review']} />

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <MetricCard label="Datum" value={`${weekdayShort(selected.date)}, ${formatDate(selected.date)}`} />
                <MetricCard label="Risiko" value={riskLabel(riskNumberToUi(selected.risk))} risk={riskNumberToUi(selected.risk)} />
                {selected.duration != null && <MetricCard label="Dauer" value={`${selected.duration} min`} />}
                {selected.location && <MetricCard label="Ort" value={selected.location} />}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                  disabled={deleteExam.isPending}
                >
                  {deleteExam.isPending ? 'Löschen…' : 'Löschen'}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold">Auto-Plan – kommende Sessions</div>
                <div className="text-xs text-slate-400">Wireframe</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
                (Kommt später) – hier erscheinen automatisch geplante Lernblöcke bis zur Prüfung.
              </div>
            </div>
          </>
        )}
      </main>

      {modalOpen && (
        <ExamModal
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreate}
          initialDate={toInputDate(addDaysISO(7))}
          subjects={subjects ?? []}
          saving={createExam.isPending}
        />
      )}
    </div>
  )
}

/* =========================== Components ========================== */

type RiskUi = 'GREEN' | 'YELLOW' | 'RED'

function RiskBadge({ risk }: { risk: RiskUi }) {
  const map: Record<RiskUi, string> = {
    GREEN: 'bg-emerald-100 text-emerald-800',
    YELLOW: 'bg-amber-100 text-amber-800',
    RED: 'bg-rose-100 text-rose-800',
  }
  return <span className={`rounded-full px-2 py-0.5 text-[11px] ${map[risk]}`}>{riskLabel(risk)}</span>
}
function riskLabel(r: RiskUi) {
  return r === 'GREEN' ? 'GRÜN' : r === 'YELLOW' ? 'GELB' : 'ROT'
}
function riskNumberToUi(n: number): RiskUi {
  if (n <= 1) return 'GREEN'
  if (n >= 3) return 'RED'
  return 'YELLOW'
}

function PlanTimeline({ phases }: { phases: string[] }) {
  return (
    <div className="relative mt-1 h-20 w-full">
      <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-slate-200" />
      <div className="relative flex h-full items-center justify-between">
        {phases.map((p, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-slate-400" />
            <div className="mt-2 rounded-md bg-slate-100 px-2 py-0.5 text-xs">{p}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MetricCard({ label, value, risk }: { label: string; value: string; risk?: RiskUi }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">
        {value}
        {risk && <span className="ml-2 align-middle"><RiskBadge risk={risk} /></span>}
      </div>
    </div>
  )
}

/* ============================== Modal ============================= */

type ExamFormValues = {
  title: string
  subjectId: string
  date: string // yyyy-mm-dd
  risk: number // 1,2,3
  duration?: number
  location?: string
  description?: string
  prepTimeNeeded?: number
}

function ExamModal({
  onClose,
  onSubmit,
  initialDate,
  subjects,
  saving,
}: {
  onClose: () => void
  onSubmit: (v: ExamFormValues) => void
  initialDate: string
  subjects: Array<{ id: string; name: string }>
  saving?: boolean
}) {
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '')
  const [date, setDate] = useState(initialDate)
  const [risk, setRisk] = useState<number>(2)
  const [duration, setDuration] = useState<number | ''>('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [prepTimeNeeded, setPrepTimeNeeded] = useState<number | ''>('')

  function submit() {
    if (!subjectId) return
    onSubmit({
      title: title.trim(),
      subjectId,
      date,
      risk,
      duration: duration === '' ? undefined : Number(duration),
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      prepTimeNeeded: prepTimeNeeded === '' ? undefined : Number(prepTimeNeeded),
    })
  }

  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-black/20 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Neue Prüfung</div>
          <button className="text-xs text-slate-500" onClick={onClose}>Schließen</button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Labeled label="Titel" className="sm:col-span-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
          </Labeled>
          <Labeled label="Fach">
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {(subjects ?? []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Labeled>
          <Labeled label="Datum">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </Labeled>
          <Labeled label="Risiko">
            <select value={risk} onChange={(e) => setRisk(Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value={1}>GRÜN</option>
              <option value={2}>GELB</option>
              <option value={3}>ROT</option>
            </select>
          </Labeled>
          <Labeled label="Dauer (min)">
            <input
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </Labeled>
          <Labeled label="Ort">
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
          </Labeled>
          <Labeled label="Beschreibung" className="sm:col-span-2">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="h-20 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
          </Labeled>
          <Labeled label="Vorbereitungszeit (min)">
            <input
              type="number"
              min={0}
              value={prepTimeNeeded}
              onChange={(e) => setPrepTimeNeeded(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
          </Labeled>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50" disabled={saving}>
            Abbrechen
          </button>
          <button onClick={submit} className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60" disabled={saving || !title.trim() || !subjectId}>
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

/* ============================= Utils ============================= */
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
function weekdayShort(iso: string) {
  return new Date(iso).toLocaleDateString('de-CH', { weekday: 'short' })
}
function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })
}