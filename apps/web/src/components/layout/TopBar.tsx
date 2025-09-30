import { Link } from '@tanstack/react-router'


interface TopBarProps {
  onOpenCmd: () => void
}

export function TopBar({ onOpenCmd }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-slate-900" />
          <div className="font-semibold">Lernplanner</div>
        </Link>

        {/* Environment Badge */}
        {import.meta.env.DEV && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            Development
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Keyboard Shortcut Hint (Desktop) */}
          <button
            onClick={onOpenCmd}
            className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm hover:bg-slate-50 md:flex"
          >
            <kbd className="text-slate-400">⌘</kbd>
            <kbd className="text-slate-400">K</kbd>
            <span className="text-slate-500">Befehl</span>
          </button>

          {/* Mobile Button */}
          <button
            onClick={onOpenCmd}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm hover:bg-slate-50 md:hidden"
          >
            Befehle
          </button>

          {/* User Avatar Placeholder */}
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100" />
        </div>
      </div>
    </header>
  )
}