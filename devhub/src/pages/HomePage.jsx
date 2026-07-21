import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  Search, 
  TrendingUp, 
  Sparkles, 
  Bookmark,
  Code2,
  Star,
  ArrowRight
} from 'lucide-react'
import SearchBar from '../components/search/SearchBar.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useNotification } from '../context/NotificationContext.jsx'
import SEOHelmet from '../components/SEO/HelmetWrapper.jsx'

function HomePage() {
  const navigate = useNavigate()
  const { showToast } = useNotification()
  const bookmarks = useSelector((state) => state.bookmarks.items)
  const recentSearches = useSelector((state) => state.search.recentSearches)

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  // Inline SVG strings as fallbacks for CDN icons
  const fallbackSvgs = {
    React: '<svg viewBox="-11.5 -10.232 23 20.463"><circle r="2.05" fill="currentColor"/><g stroke="currentColor" fill="none" stroke-width="1"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>',
    'Machine Learning': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="4" r="2.5" fill="currentColor" opacity="0.3"/><circle cx="4" cy="20" r="2.5" fill="currentColor" opacity="0.3"/><circle cx="20" cy="20" r="2.5" fill="currentColor" opacity="0.3"/><line x1="10" y1="6" x2="6" y2="18"/><line x1="14" y1="6" x2="18" y2="18"/><circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.5"/></svg>',
    Rust: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16" stroke-dasharray="4 4"/></svg>',
    TypeScript: '<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor" opacity="0.15"/><rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" stroke-width="1.5" fill="none"/><text x="12" y="17" text-anchor="middle" font-size="14" font-weight="bold" fill="currentColor">TS</text></svg>',
    Go: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8"/><path d="M8 12h8M10 9l-2 3 2 3M14 9l2 3-2 3"/><circle cx="6" cy="12" r="1.5" fill="currentColor"/><circle cx="18" cy="12" r="1.5" fill="currentColor"/></svg>',
    Python: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 9V6a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3v3" fill="currentColor" opacity="0.15"/><path d="M15 15v3a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3v-3" fill="currentColor" opacity="0.15"/><rect x="7" y="8" width="10" height="8" rx="1.5"/></svg>',
  }

  // CDN brand icons - use original for all, fallback to inline SVG on error
  const brandIcons = {
    React: { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', fallback: fallbackSvgs.React },
    'Machine Learning': { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg', fallback: fallbackSvgs['Machine Learning'] },
    Rust: { src: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/rust/rust-plain.svg', fallback: fallbackSvgs.Rust },
    TypeScript: { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', fallback: fallbackSvgs.TypeScript },
    Go: { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg', fallback: fallbackSvgs.Go },
    Python: { src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', fallback: fallbackSvgs.Python },
  }

  const trendingTopics = [
    { name: 'React', count: '2.1M', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: brandIcons.React },
    { name: 'Machine Learning', count: '1.8M', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: brandIcons['Machine Learning'] },
    { name: 'Rust', count: '750K', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', icon: brandIcons.Rust },
    { name: 'TypeScript', count: '1.2M', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20', icon: brandIcons.TypeScript },
    { name: 'Go', count: '680K', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20', icon: brandIcons.Go },
    { name: 'Python', count: '3.5M', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', icon: brandIcons.Python },
  ]

  const features = [
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find repositories by keyword, language, or topic with instant results and advanced filters.',
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Bookmark,
      title: 'Bookmark & Organize',
      description: 'Save repos with custom tags, categories, and personal notes. Export your collection anytime.',
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Star,
      title: 'Track Trends',
      description: 'Discover trending repositories and keep up with the most starred projects in your favorite languages.',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
  ]

  return (
    <>
      <SEOHelmet pageKey="home" />
      <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative container mx-auto px-4 py-3 md:py-16 lg:py-28">
          <div className="w-full max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 md:px-4 md:py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full text-[10px] sm:text-xs md:text-sm font-medium text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 mb-2 sm:mb-3 md:mb-8 animate-fadeIn">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Discover amazing open-source projects</span>
              <span className="sm:hidden">Discover open-source projects</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 md:mb-6 leading-tight">
              Find Your Next{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Favorite Repo
              </span>
            </h1>

            <p className="text-[10px] sm:text-xs md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 md:mb-8 max-w-2xl mx-auto leading-relaxed">
              <span className="hidden sm:inline">Search, explore, and bookmark the best open-source repositories from GitHub. Organize with tags and personal notes.</span>
              <span className="sm:hidden">Search, explore, and bookmark GitHub repos.</span>
            </p>

            <div className="max-w-2xl mx-auto mb-1 sm:mb-2 md:mb-8">
              <SearchBar onSearch={handleSearch} />
            </div>

            {recentSearches.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 md:gap-2 mb-2 sm:mb-3 md:mb-12">
                <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 self-center">Recent:</span>
                {recentSearches.slice(0, 4).map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-3 md:py-1 text-[10px] sm:text-xs md:text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 active:scale-95"
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-center gap-6 md:gap-12">
              <div className="text-center">
                <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {bookmarks.length}
                </div>
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Bookmarks</div>
              </div>
              <div className="w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-center">
                <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {recentSearches.length}
                </div>
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Searches</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Topics - Auto-scrolling Reel */}
      <section className="py-8 sm:py-12 md:py-16 bg-white dark:bg-gray-800/50 border-y border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 md:mb-8">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">Trending Topics</h2>
          </div>
          
          <div className="relative overflow-hidden">
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none hidden md:block" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none hidden md:block" />
            
            {/* Infinite scrolling reel */}
            <div className="flex overflow-hidden group">
              <div className="flex gap-4 py-2 animate-slideReel group-hover:[animation-play-state:paused]">
                {[...trendingTopics, ...trendingTopics, ...trendingTopics].map((topic, index) => (
                  <button
                    key={`${topic.name}-${index}`}
                    onClick={() => handleSearch(topic.name)}
                    className="group/card flex-shrink-0 text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-200"
                    style={{ width: '150px' }}
                  >
                    <div className={`w-10 h-10 rounded-lg ${topic.bg} flex items-center justify-center mb-3 group-hover/card:scale-110 transition-transform duration-200 [&_svg]:w-6 [&_svg]:h-6`}>
                      <img 
                        src={topic.icon.src} 
                        alt={topic.name}
                        className="w-6 h-6"
                        loading="lazy"
                        onError={(e) => {
                          const el = e.target
                          el.style.display = 'none'
                          const parent = el.parentElement
                          if (parent) {
                            parent.innerHTML = topic.icon.fallback
                          }
                        }}
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      {topic.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{topic.count} repos</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              Powerful features to help you discover and organize the best open-source projects.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={feature.title} className="animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                <Card className="p-6 text-center group hover:shadow-lg transition-all duration-300 h-full">
                  <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-200`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to start exploring?
          </h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            Join thousands of developers discovering amazing open-source projects every day.
          </p>
          <Button
            onClick={() => navigate('/search')}
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100 border-0 shadow-lg hover:shadow-xl"
          >
            Start Searching
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  </>
  )
}

export default HomePage