import { StudySession } from '../../types/study-session'
import { fmtTimeRange, minutesBetween } from '../../utils/date'

export default function SessionPreviewModal({
  session,
  onClose,
  onEdit,
  onDelete,
}: {
  session: StudySession
  onClose: () => void
  onEdit: (s: StudySession) => void
  onDelete: (id: string) => Promise<void> | void
}) {
  const minutes = minutesBetween(session.scheduledStart, session.scheduledEnd)
  const done = !!(session.actualStart && session.actualEnd)

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Session</div>
          <button onClick={onClose} className="text-xs text-slate-500">Schließen</button>
        </div>

        <div className="space-y-2">
          <div className="text-base font-semibold text-slate-900">{session.title}</div>
          <div className={done ? 'text-emerald-700' : 'text-slate-600'}>
            {fmtTimeRange(session.scheduledStart, session.scheduledEnd)} · {minutes} min
          </div>
          {session.notes && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {session.notes}
            </div>
          )}
          {!!session.subtasks?.length && (
            <div>
              <div className="mb-1 text-xs font-medium text-slate-600">Subtasks</div>
              <ul className="space-y-1 text-sm">
                {session.subtasks.map(st => (
                  <li key={st.id} className="rounded-lg border border-slate-200 bg-white px-2 py-1">
                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-slate-300 align-middle" />
                    {st.description} {st.completed && <span className="text-emerald-600">(erledigt)</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => onEdit(session)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            Bearbeiten
          </button>
          <button
            onClick={async () => { await onDelete(session.id); onClose() }}
            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  )
}