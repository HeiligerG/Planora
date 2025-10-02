import { useState } from 'react'

export default function CapacityEditor({
  initial,
  onSave,
  onClose,
}: {
  initial: number
  onSave: (minutes: number) => void
  onClose: () => void
}) {
  const [val, setVal] = useState(initial)

  return (
    <div
      className="absolute right-0 top-[2.75rem] z-30 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
      role="dialog"
      aria-label="Kapazität bearbeiten"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2 text-xs font-medium text-slate-600">Kapazität (Minuten)</div>
      <input
        type="range"
        min={0}
        max={480}
        step={5}
        value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        className="w-full"
      />
      <div className="mt-1 text-right text-xs text-slate-600">{val} min</div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          onClick={onClose}
        >
          Abbrechen
        </button>
        <button
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white"
          onClick={() => onSave(val)}
        >
          Speichern
        </button>
      </div>
    </div>
  )
}