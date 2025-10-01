import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/exams')({
  component: ExamsPage,
})

/* ============================ Types ============================ */
type Risk = 'GREEN' | 'YELLOW' | 'RED'

interface Exam {
  id: string
  title: string
  subject: string
  date: string       // ISO
  risk: Risk
  phases: string[]   // Plan-Phasen
  remainingMinutes: number
  daysLeft: number
  upcoming: Array<{ day: string; time: string; title: string; minutes: number }>
}

/* ========================= Mock Data ========================== */
const MOCK_EXAMS: Exam[] = [
  {
    id: rid(),
    title: 'Mathe Klausur',
    subject: 'Mathe',
    date: addDaysISO(6),
    risk: 'YELLOW',
    phases: ['Sichten', 'Üben', 'Probeklausur', 'Review'],
    remainingMinutes: 210,
    daysLeft: 7,
    upcoming: [
      { day: 'Di', time: '17:00', title: 'Mathe: Üben', minutes: 45 },
      { day: 'Mi', time: '18:00', title: 'Mathe: Probeklausur', minutes: 60 },
      { day: 'Fr', time: '16:00', title: 'Mathe: Review', minutes: 35 },
    ],
  },
  {
    id: rid(),
    title: 'Bio Test',
    subject: 'Biologie',
    date: addDaysISO(10),
    risk: 'GREEN',
    phases: ['Sichten', 'Karten', 'Üben'],
    remainingMinutes: 120,
    daysLeft: 11,
    upcoming: [
      { day: 'Do', time: '17:30', title: 'Bio: Karten', minutes: 30 },
      { day: 'Sa', time: '10:00', title: 'Bio: Üben', minutes: 45 },
    ],
  },
  {
    id: rid(),
    title: 'Englisch Listening',
    subject: 'Englisch',
    date: addDaysISO(15),
    risk: 'GREEN',
    phases: ['Listening-Sets', 'Review'],
    remainingMinutes: 90,
    daysLeft: 16,
    upcoming: [
      { day: 'Mi', time: '19:00', title: 'Englisch: Listening-Set B', minutes: 30 },
    ],
  },
]

/* ============================ Page ============================ */
function ExamsPage() {
  const [items, setItems] = useState<Exam[]>(MOCK_EXAMS)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? '')
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items
      .filter(e =>
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [items, query])

  const selected = filtered.find(e => e.id === selectedId) ?? filtered[0]

  function openCreate() {
    setModalOpen(true)
  }

  function handleCreate(values: ExamFormValues) {
    const next: Exam = {
      id: rid(),
      title: values.title.trim(),
      subject: values.subject.trim(),
      date: new Date(values.date).toISOString(),
      risk: values.risk,
      phases: splitPhases(values.phases),
      remainingMinutes: Number(values.remainingMinutes) || 0,
      daysLeft: Math.max(0, Math.ceil((new Date(values.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      upcoming: [],
    }
    setItems(prev => [next, ...prev])
    setSelectedId(next.id)
    setModalOpen(false)
  }

  function removeExam(id: string) {
    if (confirm('Diese Prüfung wirklich löschen?')) {
      setItems(prev => prev.filter(e => e.id !== id))
      if (selectedId === id && filtered.length > 0) {
        setSelectedId(filtered[0]?.id ?? '')
      }
    }
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
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white"
              title="Neue Prüfung"
            >
              + Neu
            </button>
          </div>

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
                  <RiskBadge risk={e.risk} />
                </div>
                <div className="text-xs text-slate-500">{weekdayShort(e.date)}, {formatDate(e.date)}</div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                Keine Prüfungen gefunden
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Detail */}
      <main className="col-span-12 md:col-span-8 xl:col-span-9 space-y-4">
        {selected && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold"> {selected.title} — Plan </div>
                <div className="text-xs text-slate-400">Wireframe</div>
              </div>

              <PlanTimeline phases={selected.phases} />

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <MetricCard label="Restaufwand" value={`${selected.remainingMinutes} min`} />
                <MetricCard label="Verbleibende Tage" value={`${selected.daysLeft}`} />
                <MetricCard label="Phasen" value={`${selected.phases.length} (${selected.phases.join(', ')})`} />
                <MetricCard label="Risiko" value={riskLabel(selected.risk)} risk={selected.risk} />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => removeExam(selected.id)}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100"
                >
                  Löschen
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold">Auto-Plan – kommende Sessions</div>
                <div className="text-xs text-slate-400">Wireframe</div>
              </div>

              <div className="space-y-2">
                {selected.upcoming.length === 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-sm text-slate-500">
                    Noch keine Sessions geplant
                  </div>
                )}
                {selected.upcoming.map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{s.day}</span>
                      <span className="text-slate-500">{s.time}</span>
                      <span className="font-medium">{s.title}</span>
                    </div>
                    <div className="text-slate-500">{s.minutes} min</div>
                  </div>
                ))}
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
        />
      )}
    </div>
  )
}

/* =========================== Components ========================== */

function RiskBadge({ risk }: { risk: Risk }) {
  const map: Record<Risk, string> = {
    GREEN: 'bg-emerald-100 text-emerald-800',
    YELLOW: 'bg-amber-100 text-amber-800',
    RED: 'bg-rose-100 text-rose-800',
  }
  return <span className={`rounded-full px-2 py-0.5 text-[11px] ${map[risk]}`}>{riskLabel(risk)}</span>
}
function riskLabel(risk: Risk) {
  return risk === 'GREEN' ? 'GRÜN' : risk === 'YELLOW' ? 'GELB' : 'ROT'
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

function MetricCard({ label, value, risk }: { label: string; value: string; risk?: Risk }) {
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
  subject: string
  date: string // yyyy-mm-dd
  risk: Risk
  phases: string // durch Komma getrennt
  remainingMinutes: number
}

function ExamModal({
  onClose,
  onSubmit,
  initialDate,
}: {
  onClose: () => void
  onSubmit: (v: ExamFormValues) => void
  initialDate: string
}) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [date, setDate] = useState(initialDate)
  const [risk, setRisk] = useState<Risk>('GREEN')
  const [phases, setPhases] = useState('Sichten, Üben, Probeklausur, Review')
  const [remainingMinutes, setRemainingMinutes] = useState(120)

  function submit() {
    onSubmit({
      title: title.trim(),
      subject: subject.trim(),
      date,
      risk,
      phases,
      remainingMinutes: Math.max(0, Number(remainingMinutes) || 0),
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
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
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
            <select value={risk} onChange={(e) => setRisk(e.target.value as Risk)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="GREEN">GRÜN</option>
              <option value="YELLOW">GELB</option>
              <option value="RED">ROT</option>
            </select>
          </Labeled>
          <Labeled label="Phasen (kommagetrennt)" className="sm:col-span-2">
            <input value={phases} onChange={(e) => setPhases(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
          </Labeled>
          <Labeled label="Restaufwand (min)">
            <input
              type="number"
              min={0}
              value={remainingMinutes}
              onChange={(e) => setRemainingMinutes(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
            />
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
function splitPhases(s: string) {
  return s.split(',').map(x => x.trim()).filter(Boolean)
}
function rid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return (crypto as any).randomUUID()
  return Math.random().toString(36).slice(2, 10)
}