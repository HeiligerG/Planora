import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

interface CommandPaletteProps {
  onClose: () => void
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')

  const commands = [
    {
      label: 'Dashboard',
      action: () => {
        navigate({ to: '/' })
        onClose()
      },
    },
    {
      label: 'Kalender',
      action: () => {
        navigate({ to: '/calendar' })
        onClose()
      },
    },
    {
      label: 'Aufgaben',
      action: () => {
        navigate({ to: '/tasks' })
        onClose()
      },
    },
    {
      label: 'Prüfungen',
      action: () => {
        navigate({ to: '/exams' })
        onClose()
      },
    },
    {
      label: 'Analyse',
      action: () => {
        navigate({ to: '/analytics' })
        onClose()
      },
    },
    {
      label: 'Fächer',
      action: () => {
        navigate({ to: '/subjects' })
        onClose()
      },
    },
    {
      label: 'Einstellungen',
      action: () => {
        navigate({ to: '/settings' })
        onClose()
      },
    },
  ]

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  )

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-20 grid place-items-center bg-black/20 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold">Command Palette</div>
          <button className="text-xs text-slate-500 hover:text-slate-700" onClick={onClose}>
            ESC
          </button>
        </div>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Suche nach Befehlen..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
        />

        <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          {filteredCommands.map((cmd) => (
            <button
              key={cmd.label}
              onClick={cmd.action}
              className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
            >
              {cmd.label}
            </button>
          ))}

          {filteredCommands.length === 0 && (
            <div className="py-4 text-center text-sm text-slate-400">
              Keine Befehle gefunden
            </div>
          )}
        </div>

        <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div>• Navigiere zu Seiten</div>
          <div>• Aufgaben hinzufügen (bald verfügbar)</div>
          <div>• Auto-Plan generieren (bald verfügbar)</div>
        </div>
      </div>
    </div>
  )
}