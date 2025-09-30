export function TasksIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M2 12h6" />
      <path d="M2 18h6" />
      <path d="M2 6h6" />
    </svg>
  )
}