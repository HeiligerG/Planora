import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

 interface Session {
  id: number
  subject?: string
  minutes?: number
  tags?: string[]
  done?: boolean
  exam?: string
  time?: string
  isExam?: boolean
}

interface Capacity {
  used: number
  total: number
}

interface DayColumnProps {
  day: string
  sessions: Session[]
  capacity: Capacity
}

interface SessionCardProps {
  session: Session
}

interface ExamBadgeProps {
  title: string
  time?: string
}

interface CapacityIndicatorProps {
  used: number
  total: number
}

export const Route = createFileRoute('/calendar')({
  component: CalendarPage,
})

function CalendarPage() {
  const [currentWeek, setCurrentWeek] = useState(0)

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  
  const sessions: Session[][] = [
    [
      { id: 1, subject: 'Mathe: Funktionen', minutes: 45, tags: ['#Üben'], done: true },
      { id: 2, subject: 'Englisch: Vokabeln', minutes: 30, tags: ['#Vokabeln'], done: false },
    ],
    [
      { id: 3, subject: 'Geschichte: WWI', minutes: 60, tags: ['#Lesen'], done: false },
    ],
    [
      { id: 4, subject: 'Mathe: Ableitungen', minutes: 45, tags: ['#Üben'], done: false },
      { id: 5, subject: 'Bio: Genetik', minutes: 30, tags: ['#Zusammenfassung'], done: false },
    ],
    [
      { id: 6, exam: 'Mathe Klausur', time: '08:00', isExam: true },
      { id: 7, subject: 'Englisch: Essay', minutes: 45, tags: ['#Schreiben'], done: false },
    ],
    [
      { id: 8, subject: 'Physik: Mechanik', minutes: 60, tags: ['#Probeklausur'], done: false },
    ],
    [],
    [],
  ]

  const capacity: Capacity[] = [
    { used: 75, total: 120 },
    { used: 60, total: 120 },
    { used: 75, total: 120 },
    { used: 45, total: 120 },
    { used: 60, total: 120 },
    { used: 0, total: 0 },
    { used: 0, total: 0 },
  ]

  const handlePreviousWeek = () => setCurrentWeek(prev => prev - 1)
  const handleNextWeek = () => setCurrentWeek(prev => prev + 1)

  const getWeekNumber = () => {
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
    return Math.ceil((days + startOfYear.getDay() + 1) / 7) + currentWeek
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Woche {getWeekNumber()}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousWeek}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            ← Vorherige
          </button>
          <button
            onClick={() => setCurrentWeek(0)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Heute
          </button>
          <button
            onClick={handleNextWeek}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Nächste →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-7">
        {weekDays.map((day, index) => (
          <DayColumn
            key={day}
            day={day}
            sessions={sessions[index]}
            capacity={capacity[index]}
          />
        ))}
      </div>
    </div>
  )
}

function DayColumn({ day, sessions, capacity }: DayColumnProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium text-slate-700">{day}</span>
        <CapacityIndicator used={capacity.used} total={capacity.total} />
      </div>

      <div className="space-y-2">
        {sessions.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400">Frei</div>
        ) : (
          sessions.map((session) =>
            session.isExam ? (
              <ExamBadge key={session.id} title={session.exam!} time={session.time} />
            ) : (
              <SessionCard key={session.id} session={session} />
            )
          )
        )}
      </div>
    </div>
  )
}

function SessionCard({ session }: SessionCardProps) {
  return (
    <div
      className={`rounded-xl border p-2.5 text-xs ${
        session.done
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`font-medium ${session.done ? 'text-emerald-900' : 'text-slate-700'}`}>
            {session.subject}
          </div>
          <div className={`mt-0.5 ${session.done ? 'text-emerald-600' : 'text-slate-500'}`}>
            {session.minutes} min
          </div>
        </div>
        {session.done && (
          <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </div>

      {session.tags && session.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {session.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function ExamBadge({ title, time }: ExamBadgeProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
        <div className="flex-1">
          <div className="font-medium text-amber-900">{title}</div>
          {time && <div className="mt-0.5 text-amber-700">{time} Uhr</div>}
        </div>
      </div>
    </div>
  )
}

function CapacityIndicator({ used, total }: CapacityIndicatorProps) {
  if (total === 0) {
    return <span className="text-xs text-slate-400">Frei</span>
  }

  const percentage = Math.round((used / total) * 100)
  const isOverloaded = used > total

  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full ${isOverloaded ? 'bg-rose-500' : 'bg-slate-400'}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className={`text-[10px] ${isOverloaded ? 'text-rose-600' : 'text-slate-500'}`}>
        {used}/{total}
      </span>
    </div>
  )
}