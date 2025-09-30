import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/calendar')({
  component: CalendarPage,
})

function CalendarPage() {
  const days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Woche 42</h2>
        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm">
            ← Vorherige
          </button>
          <button className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm">
            Nächste →
          </button>
        </div>
      </div>
      
      {/* Rest der Kalender-Contents */}
    </div>
  )
}