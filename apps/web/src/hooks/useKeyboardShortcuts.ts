import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export function useKeyboardShortcuts(onOpenCmd: () => void) {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Command/Ctrl + K öffnet Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenCmd()
        return
      }

      // Nur wenn keine Modifier-Keys gedrückt sind
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return

      // Ignore wenn in Input-Feld
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Keyboard Navigation (optional)
      switch (e.key) {
        case '1':
          navigate({ to: '/' })
          break
        case '2':
          navigate({ to: '/calendar' })
          break
        case '3':
          navigate({ to: '/tasks' })
          break
        case '4':
          navigate({ to: '/exams' })
          break
        case '5':
          navigate({ to: '/analytics' })
          break
        case '6':
          navigate({ to: '/subjects' })
          break
        case '7':
          navigate({ to: '/settings' })
          break
      }
    }

    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [navigate, onOpenCmd])
}