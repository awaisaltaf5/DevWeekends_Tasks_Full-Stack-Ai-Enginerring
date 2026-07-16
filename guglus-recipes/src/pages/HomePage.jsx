import { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  memo 
} from 'react'
import { Search, SlidersHorizontal, X, Zap } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useRecipes } from '../hooks/useRecipes'
import RecipeCard from '../components/recipe/RecipeCard'
import HeroCard from '../components/recipe/HeroCard'
import CategoryPills from '../components/recipe/CategoryPills'
import FilterModal from '../components/recipe/FilterModal'
import ThemeToggle from '../components/layout/ThemeToggle'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  USER_NAME: 'guglu-user-name',
  USER: 'guglu-user',
  VISITED: 'guglu-visited',
}

const ROUTES = {
  HOME: '/home',
}

const UI = {
  DEFAULT_USER_NAME: 'Chef',
  DEFAULT_CATEGORY: 'All',
  SEARCH_DEBOUNCE_MS: 350,
  MIN_TOUCH_TARGET_PX: 44,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getSafeLocalStorage = (key, fallback = '') => {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

const parseSafeJSON = (str, fallback = {}) => {
  try {
    return JSON.parse(str) ?? fallback
  } catch {
    return fallback
  }
}

const getRecipeId = (recipe) => recipe?.idMeal || recipe?.uri || recipe?.id || Math.random().toString(36)

// ─── Sub-Components (extracted for performance & readability) ──────────────

const UserAvatar = memo(function UserAvatar({ name, avatarUrl }) {
  const [imgError, setImgError] = useState(false)
  const initial = name?.[0]?.toUpperCase() ?? '?'

  return (
    <div 
      className="w-10 h-10 rounded-full bg-primary/20 dark:bg-dark-primary/20 flex items-center justify-center overflow-hidden shrink-0"
      aria-label={`${name}'s profile`}
    >
      {avatarUrl && !imgError ? (
        <img 
          src={avatarUrl} 
          alt={`${name}'s avatar`} 
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-primary dark:text-dark-primary font-bold text-sm select-none">
          {initial}
        </span>
      )}
    </div>
  )
})

const SearchBar = memo(function SearchBar({ 
  value, 
  onChange, 
  onFilterClick, 
  activeFilterCount, 
  usingEdamam 
}) {
  const inputRef = useRef(null)

  return (
    <form 
      role="search" 
      aria-label="Recipe search"
      onSubmit={(e) => e.preventDefault()}
      className="relative"
    >
      <Search 
        size={18} 
        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary dark:text-dark-text-secondary pointer-events-none" 
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        placeholder={usingEdamam ? 'Search healthy recipes…' : 'What are you cooking today?'}
        value={value}
        onChange={onChange}
        className="input-field w-full pl-11 pr-14 sm:pr-24 py-3.5 text-base rounded-2xl"
        aria-label="Search recipes"
      />
      
      <button 
        type="button"
        onClick={onFilterClick}
        aria-label={`Open filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
        aria-haspopup="dialog"
        className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-2 min-h-[${UI.MIN_TOUCH_TARGET_PX}px] rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 ${
          activeFilterCount > 0
            ? 'bg-primary dark:bg-dark-primary text-white dark:text-dark-background'
            : 'bg-border dark:bg-dark-border text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
        }`}
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        {activeFilterCount > 0 && (
          <span className="text-xs font-bold min-w-[1rem] text-center">{activeFilterCount}</span>
        )}
      </button>
    </form>
  )
})

const ActiveFilterChips = memo(function ActiveFilterChips({ filters, onClear, onClearAll }) {
  const chips = useMemo(() => {
    const result = []
    if (filters.diet) {
      result.push({ key: 'diet', label: filters.diet, variant: 'primary' })
    }
    if (filters.health) {
      filters.health.split(',').forEach((h, i) => {
        result.push({ key: `health-${i}`, label: h.trim(), variant: 'success' })
      })
    }
    if (filters.calories) {
      result.push({ key: 'calories', label: `${filters.calories} kcal`, variant: 'primary' })
    }
    return result
  }, [filters])

  if (chips.length === 0) return null

  return (
    <div 
      className="flex items-center gap-2 mt-3 flex-wrap"
      aria-label="Active filters"
    >
      {chips.map(({ key, label, variant }) => (
        <button
          key={key}
          onClick={() => onClear(key)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            variant === 'success'
              ? 'bg-success/10 text-success focus:ring-success/50'
              : 'bg-primary/10 dark:bg-dark-primary/10 text-primary dark:text-dark-primary focus:ring-primary/50'
          }`}
          aria-label={`Remove filter: ${label}`}
        >
          {label}
          <X size={12} aria-hidden="true" />
        </button>
      ))}
      <button 
        onClick={onClearAll}
        className="flex items-center gap-1 text-xs text-text-secondary dark:text-dark-text-secondary hover:text-red-500 dark:hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 rounded px-1"
        aria-label="Clear all filters"
      >
        <X size={12} aria-hidden="true" />
        Clear all
      </button>
    </div>
  )
})

const RecipeGrid = memo(function RecipeGrid({ recipes, emptyMessage, emptySubmessage }) {
  if (recipes.length === 0) {
    return (
      <EmptyState 
        message={emptyMessage}
        submessage={emptySubmessage}
      />
    )
  }

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6"
      role="list"
      aria-label="Recipe results"
    >
      {recipes.map((recipe, index) => (
        <RecipeCard 
          key={getRecipeId(recipe)} 
          recipe={recipe}
          style={{ contentVisibility: index > 6 ? 'auto' : undefined }}
        />
      ))}
    </div>
  )
})

// ─── Main Component ──────────────────────────────────────────────────────────

export default function HomePage() {
  const prefersReducedMotion = useReducedMotion()
  const abortControllerRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  
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
  const [activeCategory, setActiveCategory] = useState(UI.DEFAULT_CATEGORY)
  const [showFilterModal, setShowFilterModal] = useState(false)

  // ── Derived State (memoized) ──
  const userName = useMemo(() => 
    getSafeLocalStorage(STORAGE_KEYS.USER_NAME, UI.DEFAULT_USER_NAME),
  [])

  const userAvatar = useMemo(() => 
    parseSafeJSON(localStorage.getItem(STORAGE_KEYS.USER)).avatar || '',
  [])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (activeFilters.diet) count += 1
    if (activeFilters.health) count += activeFilters.health.split(',').length
    if (activeFilters.calories) count += 1
    return count
  }, [activeFilters])

  const featuredRecipe = useMemo(() => {
    // Only show featured when: TheMealDB, no search, All category, and has recipes
    if (usingEdamam || searchQuery || activeCategory !== UI.DEFAULT_CATEGORY || recipes.length === 0) {
      return null
    }
    return recipes[0]
  }, [recipes, usingEdamam, searchQuery, activeCategory])

  const gridRecipes = useMemo(() => {
    if (featuredRecipe) return recipes.slice(1)
    return recipes
  }, [recipes, featuredRecipe])

  const sectionTitle = useMemo(() => {
    if (usingEdamam) return 'Healthy Recipes'
    if (searchQuery) return 'Search Results'
    return `${activeCategory} Recipes`
  }, [usingEdamam, searchQuery, activeCategory])

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [])

  // ── Handlers (memoized) ──
  const handleSearch = useCallback((e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Debounce search to reduce API calls
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    
    searchTimeoutRef.current = setTimeout(() => {
      if (usingEdamam) {
        searchWithFilters(query, activeFilters)
      } else {
        searchRecipes(query)
      }
    }, UI.SEARCH_DEBOUNCE_MS)
  }, [usingEdamam, activeFilters, searchWithFilters, searchRecipes])

  const handleCategoryChange = useCallback((category) => {
    setActiveCategory(category)
    setSearchQuery('')
    setShowFilterModal(false)
    clearFilters()
    fetchRecipes(category)
  }, [clearFilters, fetchRecipes])

  const handleApplyFilters = useCallback((filters) => {
    searchWithFilters(searchQuery, filters)
  }, [searchQuery, searchWithFilters])

  const handleClearFilters = useCallback(() => {
    clearFilters()
    setSearchQuery('')
    setActiveCategory(UI.DEFAULT_CATEGORY)
  }, [clearFilters])

  const handleRemoveFilter = useCallback((filterKey) => {
    const newFilters = { ...activeFilters }
    delete newFilters[filterKey]
    searchWithFilters(searchQuery, newFilters)
  }, [activeFilters, searchQuery, searchWithFilters])

  const handleRetry = useCallback(() => {
    if (usingEdamam) {
      searchWithFilters(searchQuery, activeFilters)
    } else {
      fetchRecipes(activeCategory)
    }
  }, [usingEdamam, searchQuery, activeFilters, activeCategory, searchWithFilters, fetchRecipes])

  // ── Animation variants ──
  const fadeInUp = useMemo(() => ({
    initial: prefersReducedMotion ? {} : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  }), [prefersReducedMotion])

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] pb-24 md:pb-8 bg-background dark:bg-dark-background">
      
      {/* Skip link for keyboard users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* ── Sticky Header ── */}
      <header 
        className="sticky top-[3.5rem] md:top-0 z-40 bg-background/80 dark:bg-dark-background/80 backdrop-blur-xl border-b border-border/50 dark:border-dark-border/50"
        role="banner"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          
          {/* User greeting row */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="min-w-0">
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary truncate">
                Good to see you,
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-dark-text-primary truncate">
                Hi, {userName}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
              <ThemeToggle />
              <UserAvatar name={userName} avatarUrl={userAvatar} />
            </div>
          </div>

          {/* Search */}
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            onFilterClick={() => setShowFilterModal(true)}
            activeFilterCount={activeFilterCount}
            usingEdamam={usingEdamam}
          />

          {/* Active filters */}
          <ActiveFilterChips 
            filters={activeFilters}
            onClear={handleRemoveFilter}
            onClearAll={handleClearFilters}
          />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main 
        id="main-content"
        className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4 md:pt-6 pb-6 space-y-4 sm:space-y-6"
        tabIndex={-1}
      >
        {/* Category Pills */}
        {!usingEdamam && (
          <CategoryPills 
            activeCategory={activeCategory} 
            onCategoryChange={handleCategoryChange} 
          />
        )}

        {/* Edamam indicator */}
        {usingEdamam && (
          <motion.div
            {...fadeInUp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium"
            role="status"
            aria-live="polite"
          >
            <Zap size={14} className="shrink-0" aria-hidden="true" />
            <span className="truncate">Showing healthy recipes with nutrition data</span>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12 sm:py-16" role="status" aria-label="Loading recipes">
            <LoadingSpinner size={48} />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div 
            className="text-center py-8 px-4"
            role="alert"
            aria-live="assertive"
          >
            <p className="text-red-500 dark:text-red-400 mb-3 text-base">{error}</p>
            <button 
              onClick={handleRetry}
              className="btn-primary text-sm px-5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Featured Hero */}
            {featuredRecipe && (
              <section aria-label="Featured recipe">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base sm:text-lg font-bold text-text-primary dark:text-dark-text-primary">
                    Featured Recipe
                  </h2>
                </div>
                <HeroCard recipe={featuredRecipe} />
              </section>
            )}

            {/* Recipe Grid */}
            <section aria-label={sectionTitle}>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-bold text-text-primary dark:text-dark-text-primary truncate pr-4">
                  {sectionTitle}
                </h2>
                <span 
                  className="text-sm text-text-secondary dark:text-dark-text-secondary shrink-0"
                  aria-live="polite"
                >
                  {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
                </span>
              </div>

              <RecipeGrid
                recipes={gridRecipes}
                emptyMessage={usingEdamam ? 'No healthy recipes found' : 'No recipes found'}
                emptySubmessage={usingEdamam ? 'Try adjusting your filters' : 'Try a different search or category'}
              />
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