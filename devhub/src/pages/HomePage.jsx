import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, Sparkles, Zap } from 'lucide-react'
import SearchBar from '../components/search/SearchBar.jsx'
import Button from '../components/ui/Button.jsx'
import { useNotification } from '../context/NotificationContext.jsx'

function HomePage() {
  const navigate = useNavigate()
  const { showToast } = useNotification()

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  const testNotifications = () => {
    showToast('Repository bookmarked!', 'success')
    setTimeout(() => showToast('Something went wrong', 'error'), 500)
    setTimeout(() => showToast('Please check your input', 'warning'), 1000)
    setTimeout(() => showToast('New update available', 'info'), 1500)
  }

  // ... rest of your HomePage code

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        {/* ... existing hero content ... */}
        
        {/* Test Button */}
        <Button onClick={testNotifications} variant="secondary" className="mt-4">
          Test Notifications
        </Button>
      </section>
      
      {/* ... rest of page ... */}
    </div>
  )
}

export default HomePage