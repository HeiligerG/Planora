// src/components/SubjectSelect.tsx
import { useSubjects } from '../../hooks/useSubjects'

type Props = {
  value?: string | null
  onChange: (id: string | null) => void
  className?: string
  disabled?: boolean
  allowNone?: boolean
  noneLabel?: string
}

export default function SubjectSelect({
  value = null,
  onChange,
  className = '',
  disabled,
  allowNone = false,
  noneLabel = '— Kein Fach —',
}: Props) {
  const { data, isLoading } = useSubjects()
  const subjects = data ?? []

  const isDisabled = disabled || isLoading || subjects.length === 0

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={`rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ${className}`}
      disabled={isDisabled}
    >
      {allowNone && <option value="">{noneLabel}</option>}
      {subjects.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  )
}
