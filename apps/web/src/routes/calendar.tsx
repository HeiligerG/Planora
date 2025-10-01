import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useStudySessions, StudySession } from '../hooks/useStudySessions'

export const Route = createFileRoute('/calendar')({
  component: CalendarPage,
})

function CalendarPage() {
  const [currentWeek, setCurrentWeek] = useState(0)

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

  const { startDate, endDate } = useMemo(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    
    const start = new Date(now)
    start.setDate(now.getDate() + diff + currentWeek * 7)
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setDate(start.getDate() + 7)
    end.setHours(23, 59, 59, 999)

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    }
  }, [currentWeek])

  const { data: sessions, isLoading, error } = useStudySessions(startDate, endDate)

  const sessionsByDay = useMemo<StudySession[][]>(() => {
    if (!sessions) return Array.from({ length: 7 }, () => [] as StudySession[])

    const byDay: StudySession[][] = Array.from({ length: 7 }, () => [])

    sessions.forEach((session: StudySession) => {
      const sessionDate = new Date(session.scheduledStart)
      const start = new Date(startDate)
      const daysDiff = Math.floor((sessionDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff >= 0 && daysDiff < 7) byDay[daysDiff].push(session)
    })

    return byDay
  }, [sessions, startDate])

  const capacityByDay = useMemo(() => {
    return sessionsByDay.map(daySessions => {
      const total = 120
      const used = daySessions.reduce((sum, session) => {
        const minutes = Math.round(
          (new Date(session.scheduledEnd).getTime() - new Date(session.scheduledStart).getTime()) / 60000
        )
        return sum + minutes
      }, 0)
      return { used, total }
    })
  }, [sessionsByDay])

  const handlePreviousWeek = () => setCurrentWeek(prev => prev - 1)
  const handleNextWeek = () => setCurrentWeek(prev => prev + 1)

  const getWeekNumber = () => {
    const date = new Date(startDate)
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
    return Math.ceil((days + startOfYear.getDay() + 1) / 7)
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
        Fehler beim Laden der Sessions: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
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

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Lade Sessions...
        </div>
      )}

      {/* Wochenansicht */}
      {!isLoading && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-7">
          {weekDays.map((day, index) => (
            <DayColumn
              key={day}
              day={day}
              sessions={sessionsByDay[index]}
              capacity={capacityByDay[index]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface DayColumnProps {
  day: string
  sessions: any[]
  capacity: { used: number; total: number }
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
          sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))
        )}
      </div>
    </div>
  )
}

interface SessionCardProps {
  session: any
}

function SessionCard({ session }: SessionCardProps) {
  const isDone = session.actualStart && session.actualEnd
  const minutes = Math.round(
    (new Date(session.scheduledEnd).getTime() - new Date(session.scheduledStart).getTime()) / 60000
  )

  return (
    <div
      className={`cursor-pointer rounded-xl border p-2.5 text-xs transition-colors ${
        isDone
          ? 'border-emerald-200 bg-emerald-50'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`font-medium ${isDone ? 'text-emerald-900' : 'text-slate-700'}`}>
            {session.title}
          </div>
          <div className={`mt-0.5 ${isDone ? 'text-emerald-600' : 'text-slate-500'}`}>
            {minutes} min
          </div>
        </div>
        {isDone && (
          <svg
            className="h-4 w-4 text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </div>

      {session.subtasks && session.subtasks.length > 0 && (
        <div className="mt-2 text-[10px] text-slate-500">
          {session.subtasks.filter((st: any) => st.completed).length}/{session.subtasks.length} Subtasks
        </div>
      )}
    </div>
  )
}

interface CapacityIndicatorProps {
  used: number
  total: number
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
          className={`h-full transition-all ${isOverloaded ? 'bg-rose-500' : 'bg-slate-400'}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <span className={`text-[10px] ${isOverloaded ? 'text-rose-600' : 'text-slate-500'}`}>
        {used}/{total}
      </span>
    </div>
  )
}