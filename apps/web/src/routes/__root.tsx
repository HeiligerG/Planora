import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useState } from 'react'
import { TopBar } from '../components/layout/TopBar'
import { Nav } from '../components/layout/Nav'
import { TagLegend } from '../components/layout/TagLegend'
import { CommandPalette } from '../components/CommandPalette'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const [showCmd, setShowCmd] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopBar onOpenCmd={() => setShowCmd(true)} />
      
      <div className="mx-auto max-w-[1400px] px-4 pb-12">
        <div className="mt-4 grid grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3 lg:col-span-2">
            <Nav />
            <TagLegend className="mt-4" />
          </aside>

          {/* Main Content */}
          <main className="col-span-12 md:col-span-9 lg:col-span-10">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Command Palette Modal */}
      {showCmd && <CommandPalette onClose={() => setShowCmd(false)} />}

      {/* DevTools (nur Development) */}
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  )
}