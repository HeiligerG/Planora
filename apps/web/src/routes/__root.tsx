import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <>
      <nav className="p-4 flex gap-4 bg-gray-100">
        <Link to="/" className="[&.active]:font-bold">Home</Link>
        <Link to="/about" className="[&.active]:font-bold">About</Link>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </>
  ),
});