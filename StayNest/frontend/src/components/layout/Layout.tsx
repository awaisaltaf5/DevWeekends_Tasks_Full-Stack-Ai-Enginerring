import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

/**
 * Reusable application shell: sticky responsive navbar + page content + footer.
 * Every route is rendered through an <Outlet />. The <main> is keyed by the
 * current pathname so each navigation plays a short, subtle fade-in.
 */
export default function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main key={pathname} className="page-enter flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

