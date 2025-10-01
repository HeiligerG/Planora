import { createRootRoute, Outlet, useRouter } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useAuthStore } from '../stores/authStore'
import { TopBar } from '../components/layout/TopBar'
import { Nav } from '../components/layout/Nav'
import { TagLegend } from '../components/layout/TagLegend'
import { CommandPalette } from '../components/CommandPalette'
import { useEffect, useState } from 'react'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { isAuthenticated, checkAuth } = useAuthStore()
  const [showCmd, setShowCmd] = useState(false)
  const router = useRouter()
  const currentPath = router.state.location.pathname

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.includes(currentPath)

  useEffect(() => {
    if (!isAuthenticated && !isPublicRoute) {
      router.navigate({ to: '/login' })
    }
  }, [isAuthenticated, isPublicRoute, router])

  if (isPublicRoute) {
    return (
      <>
        <Outlet />
        {import.meta.env.DEV && <TanStackRouterDevtools />}
      </>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopBar onOpenCmd={() => setShowCmd(true)} />
      
      <div className="mx-auto max-w-[1400px] px-4 pb-12">
        <div className="mt-4 grid grid-cols-12 gap-4">
          <aside className="col-span-12 md:col-span-3 lg:col-span-2">
            <Nav />
            <TagLegend className="mt-4" />
          </aside>

          <main className="col-span-12 md:col-span-9 lg:col-span-10">
            <Outlet />
          </main>
        </div>
      </div>

      {showCmd && <CommandPalette onClose={() => setShowCmd(false)} />}
      
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  )
}