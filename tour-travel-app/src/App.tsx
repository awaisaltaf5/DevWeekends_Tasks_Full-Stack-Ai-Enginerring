import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { SearchProvider } from './contexts/SearchContext'
import MainLayout from './components/templates/MainLayout'
import HomePage from './pages/HomePage'
import DestinationsPage from './pages/DestinationsPage'
import PackagesPage from './pages/PackagesPage'
import AboutPage from './pages/AboutPage'
import SearchResultsPage from './pages/SearchResultsPage'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SearchProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/destinations" element={<DestinationsPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
            </Route>
          </Routes>
        </SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App