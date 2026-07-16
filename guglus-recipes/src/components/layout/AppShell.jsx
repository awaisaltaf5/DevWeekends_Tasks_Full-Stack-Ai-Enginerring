import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-background dark:bg-dark-background transition-colors duration-300 overflow-x-hidden">
      {/* Skip link - hidden until focused, lets keyboard users jump past the
          nav straight to page content instead of tabbing through it every time */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-primary focus:text-white focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      <main
        id="main-content"
        className="pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))] md:pt-0 md:pb-0 md:pl-20"
      >
        {children || <Outlet />}
      </main>

      <BottomNav />
    </div>
  )
}