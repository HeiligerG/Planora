import { createFileRoute } from '@tanstack/react-router'
import { KpiCard } from '../components/ui/KpiCard'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Heute erledigt" value="95/120 min" subtitle="79% Plan‑Erfüllung" />
        <KpiCard title="Woche" value="460/600 min" subtitle="Overdue: 90 min" />
        <KpiCard title="Top‑Fach" value="Englisch" subtitle="Plan‑Treffer: 92%" />
        <KpiCard 
          title="Exam‑Risiko" 
          value="GELB" 
          subtitle="Mathe: 210 min Rest" 
          badgeClass="bg-amber-100 text-amber-800" 
        />
      </section>

      {/* Rest des Dashboard-Contents */}
    </div>
  )
}