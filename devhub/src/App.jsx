import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import Navbar from './components/layout/Navbar.jsx'
import MobileNav from './components/layout/MobileNav.jsx'
import HomePage from './pages/HomePage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import BookmarkPage from './pages/BookmarkPage.jsx'
import RepoDetailPage from './pages/RepoDetailPage.jsx'

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Navbar />
          <main className="pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/bookmarks" element={<BookmarkPage />} />
              <Route path="/repo/:owner/:name" element={<RepoDetailPage />} />
            </Routes>
          </main>
          <MobileNav />
        </div>
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App