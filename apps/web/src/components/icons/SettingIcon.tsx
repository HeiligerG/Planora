export function SettingsIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m10-7h-6M8 12H2m15.364 6.364l-4.243-4.243m0-4.242l4.243-4.243M6.636 6.636l4.243 4.243m0 4.242l-4.243 4.243" />
    </svg>
  )
}