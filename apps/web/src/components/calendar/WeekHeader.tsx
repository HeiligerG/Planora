export default function WeekHeader({
  label, onPrev, onToday, onNext, onCreate, onBulk, creating,
}: {
  label: string
  onPrev: () => void
  onToday: () => void
  onNext: () => void
  onCreate: () => void
  onBulk: () => void
  creating?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold tracking-tight">{label}</h2>
      <div className="flex gap-2">
        <button onClick={onPrev} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50">← Vorherige</button>
        <button onClick={onToday} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50">Heute</button>
        <button onClick={onNext} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50">Nächste →</button>
        <button onClick={onBulk} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50">Auto-Plan</button>
        <button onClick={onCreate} className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-60" disabled={creating}>+ Session</button>
      </div>
    </div>
  )
}