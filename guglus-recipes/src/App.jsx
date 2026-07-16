import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import AppShell from './components/layout/AppShell'

import WelcomePage from './pages/WelcomePage'
import HomePage from './pages/HomePage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <ThemeProvider>
      <AppShell>
        <Routes>
          {/* Welcome page always shows first */}
          <Route path="/" element={<WelcomePage />} />
          
          {/* Home page only accessible after clicking Start Cooking */}
          <Route path="/home" element={<HomePage />} />
          
          <Route path="/recipe/:id" element={<RecipeDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/search" element={<HomePage />} />
          <Route path="/create" element={<ProfilePage />} />
          <Route path="/saved" element={<ProfilePage />} />
          
        </Routes>
      </AppShell>
    </ThemeProvider>
  )
}

export default App