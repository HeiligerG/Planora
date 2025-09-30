export function DashboardIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 13h8V3H3v10z" />
      <path d="M13 21h8V3h-8v18z" />
      <path d="M3 21h8v-6H3v6z" />
    </svg>
  )
}