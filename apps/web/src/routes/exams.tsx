import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/exams')({
  component: Exams,
})

function Exams() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Prüfungen</h2>
        <div className="flex gap-2">
          <input 
            placeholder="Suchen…" 
            className="w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" 
          />
          <button className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white">
            + Neu
          </button>
        </div>
      </div>
      
      {/* Rest der Prüfungs-Tabelle */}
    </div>
  )
}