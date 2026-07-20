import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, Sparkles, Zap } from 'lucide-react'
import SearchBar from '../components/search/SearchBar.jsx'
import Button from '../components/ui/Button.jsx'

function HomePage() {
  const navigate = useNavigate()

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  const trendingTopics = [
    { name: 'React', count: '2.1M repos' },
    { name: 'Machine Learning', count: '1.8M repos' },
    { name: 'Web3', count: '890K repos' },
    { name: 'Rust', count: '750K repos' },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Discover open-source projects
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Find Your Next
            <span className="text-blue-600 dark:text-blue-400"> Favorite Repo</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Search, explore, and bookmark the best open-source repositories from GitHub.
            Organize with tags and personal notes.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-2xl mb-12">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Trending Topics */}
        <div className="w-full max-w-3xl">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>Trending topics</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {trendingTopics.map((topic) => (
              <button
                key={topic.name}
                onClick={() => handleSearch(topic.name)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all"
              >
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{topic.name}</span>
                <span className="text-xs text-gray-400">{topic.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'Smart Search',
                desc: 'Find repositories by keyword, language, or topic with instant results.',
              },
              {
                icon: Bookmark,
                title: 'Bookmark & Organize',
                desc: 'Save repos with custom tags and personal notes for later reference.',
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                desc: 'Built with modern tech for a blazing fast experience.',
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage