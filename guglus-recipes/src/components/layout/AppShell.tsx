import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-background dark:bg-dark-background transition-colors duration-300">
      <main className="pb-20 md:pb-0 md:pl-20">
        {children || <Outlet />}
      </main>
      <BottomNav />
    </div>
  )
}