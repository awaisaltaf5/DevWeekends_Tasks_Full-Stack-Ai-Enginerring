import { useState } from 'react'
import { Search, SlidersHorizontal, X, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRecipes } from '../hooks/useRecipes'
import RecipeCard from '../components/recipe/RecipeCard'
import HeroCard from '../components/recipe/HeroCard'
import CategoryPills from '../components/recipe/CategoryPills'
import FilterModal from '../components/recipe/FilterModal'
import ThemeToggle from '../components/layout/ThemeToggle'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

export default function HomePage() {
  const { 
    recipes, 
    loading, 
    error, 
    fetchRecipes, 
    searchRecipes,
    searchWithFilters,
    clearFilters,
    activeFilters,
    usingEdamam
  } = useRecipes()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [showFilterModal, setShowFilterModal] = useState(false)

  const featuredRecipe = recipes[0]
  const gridRecipes = recipes.slice(1)

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (usingEdamam) {
      searchWithFilters(query, activeFilters)
    } else {
      searchRecipes(query)
    }
  }

  const handleCategoryChange = (category) => {
    setActiveCategory(category)
    setSearchQuery('')
    setShowFilterModal(false)
    clearFilters()
    fetchRecipes(category)
  }

  const handleApplyFilters = (filters) => {
    searchWithFilters(searchQuery, filters)
  }

  const handleClearFilters = () => {
    clearFilters()
    setSearchQuery('')
    setActiveCategory('All')
  }

  const userName = localStorage.getItem('guglu-user-name') || 'Chef'
  const userAvatar = JSON.parse(localStorage.getItem('guglu-user') || '{}').avatar || ''

  const activeFilterCount = [
    activeFilters.diet ? 1 : 0,
    activeFilters.health ? activeFilters.health.split(',').length : 0,
    activeFilters.calories ? 1 : 0
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <header className="sticky top-14 md:top-0 z-40 bg-background/80 dark:bg-dark-background/80 backdrop-blur-lg border-b border-border/50 dark:border-dark-border/50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Good to see you,</p>
              <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                Hi, {userName} 
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="w-10 h-10 rounded-full bg-primary/20 dark:bg-dark-primary/20 flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary dark:text-dark-primary font-bold text-sm">
                    {userName[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar with Filter Button */}
          <div className="relative">
            <Search 
              size={18} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary dark:text-dark-text-secondary" 
            />
            <input
              type="text"
              placeholder={usingEdamam ? "Search healthy recipes..." : "What are you cooking today?"}
              value={searchQuery}
              onChange={handleSearch}
              className="input-field pl-11 pr-24 py-3.5 text-base"
            />
            
            {/* Filter button */}
            <button 
              onClick={() => setShowFilterModal(true)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                activeFilterCount > 0
                  ? 'bg-primary dark:bg-dark-primary text-white dark:text-dark-background'
                  : 'bg-border dark:bg-dark-border text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
              }`}
            >
              <SlidersHorizontal size={16} />
              {activeFilterCount > 0 && (
                <span className="text-xs font-bold">{activeFilterCount}</span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {activeFilters.diet && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary text-xs font-medium">
                  {activeFilters.diet}
                </span>
              )}
              {activeFilters.health && activeFilters.health.split(',').map(h => (
                <span key={h} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success/10 text-success text-xs font-medium">
                  {h}
                </span>
              ))}
              {activeFilters.calories && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary text-xs font-medium">
                  {activeFilters.calories} kcal
                </span>
              )}
              <button 
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-xs text-text-secondary dark:text-dark-text-secondary hover:text-red-500 transition-colors"
              >
                <X size={12} />
                Clear all
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 pt-2 md:pt-6 pb-6 space-y-6">
        {/* Category Pills - hidden when using Edamam filters */}
        {!usingEdamam && (
          <CategoryPills 
            activeCategory={activeCategory} 
            onCategoryChange={handleCategoryChange} 
          />
        )}

        {/* Edamam indicator */}
        {usingEdamam && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium"
          >
            <Zap size={14} />
            Showing healthy recipes with nutrition data
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={50} />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-red-500 dark:text-red-400 mb-3">{error}</p>
            <button 
              onClick={() => usingEdamam ? searchWithFilters(searchQuery, activeFilters) : fetchRecipes(activeCategory)}
              className="btn-primary text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Featured Hero - only for TheMealDB */}
            {featuredRecipe && !searchQuery && !usingEdamam && activeCategory === 'All' && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">
                    Featured Recipe
                  </h2>
                </div>
                <HeroCard recipe={featuredRecipe} />
              </section>
            )}

            {/* Recipe Grid */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">
                  {usingEdamam ? 'Healthy Recipes' : searchQuery ? 'Search Results' : `${activeCategory} Recipes`}
                </h2>
                <span className="text-sm text-text-secondary dark:text-dark-text-secondary">
                  {recipes.length} recipes
                </span>
              </div>

              {recipes.length === 0 ? (
                <EmptyState 
                  message={usingEdamam ? "No healthy recipes found" : "No recipes found"}
                  submessage={usingEdamam ? "Try adjusting your filters" : "Try a different search or category"}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {recipes.map((recipe) => (
                    <RecipeCard key={recipe.idMeal} recipe={recipe} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        currentFilters={activeFilters}
      />
    </div>
  )
}