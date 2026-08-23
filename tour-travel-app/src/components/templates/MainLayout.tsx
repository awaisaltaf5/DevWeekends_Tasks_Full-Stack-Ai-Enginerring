import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../organisms/Navbar'
import Footer from '../organisms/Footer'
import LoginModal from '../molecules/LoginModal'
import ScrollToTop from '../molecules/ScrollToTop'

export default function MainLayout() {
  const { pathname } = useLocation()

  // Scroll to top on route change with smooth animation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LoginModal />
      <ScrollToTop />
    </div>
  )
}