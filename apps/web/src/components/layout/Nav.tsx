import { Link, useRouterState } from '@tanstack/react-router'
import {
  DashboardIcon,
  CalendarIcon,
  TasksIcon,
  ExamsIcon,
  AnalyticsIcon,
  SubjectsIcon,
  SettingsIcon,
} from '../icons'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon },
  { to: '/calendar', label: 'Kalender', icon: CalendarIcon },
  { to: '/tasks', label: 'Aufgaben', icon: TasksIcon },
  { to: '/exams', label: 'Prüfungen', icon: ExamsIcon },
  { to: '/analytics', label: 'Analyse', icon: AnalyticsIcon },
  { to: '/subjects', label: 'Fächer', icon: SubjectsIcon },
  { to: '/settings', label: 'Einstellungen', icon: SettingsIcon },
]

export function Nav() {
  const router = useRouterState()
  const currentPath = router.location.pathname

  return (
    <nav className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = currentPath === item.to

        return (
          <Link
            key={item.to}
            to={item.to}
            className={`group mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50 ${
              isActive ? 'bg-slate-100' : ''
            }`}
          >
            <span className="inline-flex h-5 w-5 items-center justify-center">
              <Icon className={`h-5 w-5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
            </span>
            <span className={`flex-1 ${isActive ? 'font-medium' : 'text-slate-600'}`}>
              {item.label}
            </span>
            {isActive && (
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                aktiv
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}