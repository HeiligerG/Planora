import { useState } from 'react'
import { useSuggestSlots, SuggestPayload } from '../hooks/useScheduler'
import { useBulkCreateSessions } from '../hooks/useStudySessions'
import SubjectSelect from '../components/ui/SubjectSelect'
import { CreateStudySessionDto } from '../lib/api'

/** Erweitertes Payload fürs UI: subjectId & preferredStart (HH:MM) */
type SuggestModel = SuggestPayload & {
  subjectId?: string | null
  preferredStart?: string // "HH:MM" (lokale Zeit)
}

export default function BulkPlanWizard({
  onClose,
  defaultWindow,
}: {
  onClose: () => void
  defaultWindow?: { fromISO: string; toISO: string }
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [previewSessions, setPreviewSessions] = useState<CreateStudySessionDto[] | null>(null)

  const [payload, setPayload] = useState<SuggestModel>({
    title: '',
    sessionMinutes: 45,
    totalMinutes: 180,
    window: {
      fromISO: defaultWindow?.fromISO ?? startOfDayLocalToISO(todayLocalDate()),
      toISO: defaultWindow?.toISO ?? endOfDayLocalToISO(plusDaysLocalDate(todayLocalDate(), 10)),
      days: [1, 2, 3, 4, 5], // Mo–Fr (1..7)
    },
    maxPerDay: 1,
    gapMinutes: 10,
    subjectId: null,
    preferredStart: '17:00', // Default: 17:00
  })

  const suggest = useSuggestSlots()
  const bulkCreate = useBulkCreateSessions()

  async function preview() {
    const slots = await suggest.mutateAsync(payload)
    setPreviewSessions(slots)
    setStep(3)
  }

  async function confirm() {
    if (!previewSessions || previewSessions.length === 0) return
    await bulkCreate.mutateAsync({ sessions: previewSessions })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Auto-Plan (Bulk)</div>
          <button className="text-xs text-slate-500" onClick={onClose}>Schließen</button>
        </header>

        {step === 1 && (
          <Step1Source
            value={{ title: payload.title }}
            onChange={(v) => setPayload(p => ({ ...p, title: v.title }))}
          />
        )}

        {step === 2 && (
          <Step2Params
            value={payload}
            onChange={setPayload}
            right={
              <SubjectSelect
                value={payload.subjectId ?? null}
                onChange={(id) => setPayload(p => ({ ...p, subjectId: id }))}
              />
            }
          />
        )}

        {step === 3 && (
          <Step3Preview
            loading={suggest.isPending}
            items={previewSessions ?? []}
          />
        )}

        <footer className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            Abbrechen
          </button>

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white"
            >
              Weiter
            </button>
          )}

          {step === 2 && (
            <button
              onClick={preview}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60"
              disabled={suggest.isPending}
            >
              {suggest.isPending ? 'Berechne…' : 'Vorschau'}
            </button>
          )}

          {step === 3 && (
            <button
              onClick={confirm}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60"
              disabled={bulkCreate.isPending}
            >
              {bulkCreate.isPending ? 'Bucht…' : 'Bestätigen & Buchen'}
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}

/* ------------------------------ Step 1 ------------------------------ */
function Step1Source({
  value, onChange,
}: {
  value: { title: string }
  onChange: (v: { title: string }) => void
}) {
  return (
    <div className="grid gap-3">
      <Labeled label="Titel (z. B. „Mathe: Üben“)" className="sm:col-span-2">
        <input
          value={value.title}
          onChange={e => onChange({ title: e.target.value })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
        />
      </Labeled>
      <div className="text-xs text-slate-500">
        Tipp: Der Titel wird auf alle automatisch geplanten Sessions angewendet.
      </div>
    </div>
  )
}

/* ------------------------------ Step 2 ------------------------------ */
function Step2Params({
  value,
  onChange,
  right,
}: {
  value: SuggestModel
  onChange: (v: SuggestModel) => void
  right?: React.ReactNode
}) {
  const startDate = toLocalDate(value.window.fromISO)
  const endDate = toLocalDate(value.window.toISO)

  function setStartDate(d: string) {
    onChange({
      ...value,
      window: { ...value.window, fromISO: startOfDayLocalToISO(d) },
    })
  }
  function setEndDate(d: string) {
    onChange({
      ...value,
      window: { ...value.window, toISO: endOfDayLocalToISO(d) },
    })
  }
  function toggleDay(day: number) {
    const has = value.window.days.includes(day)
    const days = has
      ? value.window.days.filter((x) => x !== day)
      : [...value.window.days, day].sort((a, b) => a - b)
    onChange({ ...value, window: { ...value.window, days } })
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Labeled label="Von">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
        />
      </Labeled>
      <Labeled label="Bis">
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
        />
      </Labeled>

      <Labeled label="Startzeit">
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={value.preferredStart ?? ''}
            onChange={(e) => onChange({ ...value, preferredStart: e.target.value })}
            className="w-36 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          />
          <span className="text-xs text-slate-500">
            Ende = Start + <b>{value.sessionMinutes}</b> min
          </span>
        </div>
      </Labeled>
      <div />

      <Labeled label="Session-Länge (min)">
        <input
          type="number"
          min={5}
          step={5}
          value={value.sessionMinutes}
          onChange={(e) => onChange({ ...value, sessionMinutes: Math.max(5, Number(e.target.value) || 0) })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
        />
      </Labeled>
      <Labeled label="Gesamt-Budget (min)">
        <input
          type="number"
          min={0}
          step={5}
          value={value.totalMinutes}
          onChange={(e) => onChange({ ...value, totalMinutes: Math.max(0, Number(e.target.value) || 0) })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
        />
      </Labeled>

      <Labeled label="Max. Sessions pro Tag">
        <input
          type="number"
          min={1}
          value={value.maxPerDay}
          onChange={(e) => onChange({ ...value, maxPerDay: Math.max(1, Number(e.target.value) || 1) })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
        />
      </Labeled>
      <Labeled label="Mindest-Abstand zwischen Sessions (min)">
        <input
          type="number"
          min={0}
          step={5}
          value={value.gapMinutes}
          onChange={(e) => onChange({ ...value, gapMinutes: Math.max(0, Number(e.target.value) || 0) })}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
        />
      </Labeled>

      <Labeled label="Wochentage" className="md:col-span-2">
        <div className="flex flex-wrap gap-1.5">
          {[
            { d: 1, l: 'Mo' },
            { d: 2, l: 'Di' },
            { d: 3, l: 'Mi' },
            { d: 4, l: 'Do' },
            { d: 5, l: 'Fr' },
            { d: 6, l: 'Sa' },
            { d: 7, l: 'So' },
          ].map((x) => {
            const active = value.window.days.includes(x.d)
            return (
              <button
                key={x.d}
                type="button"
                onClick={() => toggleDay(x.d)}
                className={`rounded-lg px-2 py-1 text-xs border ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {x.l}
              </button>
            )
          })}
        </div>
      </Labeled>

      <Labeled label="Fach (optional)" className="md:col-span-2">
        {right}
      </Labeled>
    </div>
  )
}

/* ------------------------------ Step 3 ------------------------------ */
function Step3Preview({ loading, items }: { loading: boolean; items: CreateStudySessionDto[] }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm">
        Berechne Slots…
      </div>
    )
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 text-xs text-slate-500">Vorschau: {items.length} Sessions</div>
      <ul className="max-h-80 space-y-1 overflow-auto pr-1 text-sm">
        {items.map((it, i) => (
          <li key={i} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">
            {it.title} –{' '}
            {new Date(it.scheduledStart).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' })}
            {' '}→{' '}
            {new Date(it.scheduledEnd).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------ UI Helpers ------------------------------ */
function Labeled({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`space-y-1 ${className}`}>
      <div className="text-xs font-medium text-slate-600">{label}</div>
      {children}
    </label>
  )
}

/* ------------------------------ Date Helpers ------------------------------ */
function todayLocalDate() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function plusDaysLocalDate(localDate: string, days: number) {
  const [y, m, d] = localDate.split('-').map(Number)
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1)
  dt.setDate(dt.getDate() + days)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}
function toLocalDate(iso: string) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function startOfDayLocalToISO(localDate: string) {
  const [y, m, d] = localDate.split('-').map(Number)
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0)
  return dt.toISOString()
}
function endOfDayLocalToISO(localDate: string) {
  const [y, m, d] = localDate.split('-').map(Number)
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, 23, 59, 59, 999)
  return dt.toISOString()
}