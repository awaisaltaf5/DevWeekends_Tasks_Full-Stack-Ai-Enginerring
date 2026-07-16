import { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo,
  memo 
} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Clock, Star, ChefHat, Users, Bookmark } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useRecipeDetail } from '../hooks/useRecipeDetail'
import { useCollections } from '../hooks/useCollections'
import ToggleTabs from '../components/recipe/ToggleTabs'
import IngredientCard from '../components/recipe/IngredientCard'
import InstructionStep from '../components/recipe/InstructionStep'
import SaveToCollectionModal from '../components/recipe/SaveToCollectionModal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

// ─── Sub-Components ────────────────────────────────────────────────────────────

const ActionButton = memo(function ActionButton({ 
  onClick, 
  isActive, 
  activeClass, 
  inactiveClass, 
  icon: Icon, 
  label, 
  size = 22 
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      className={`
        w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center 
        transition-all duration-200 active:scale-90
        focus:outline-none focus:ring-2 focus:ring-white/50
        min-h-[44px] min-w-[44px] touch-manipulation
        ${isActive ? activeClass : inactiveClass}
      `}
    >
      <Icon size={size} className={isActive ? 'fill-current' : ''} aria-hidden="true" />
    </button>
  )
})

const StatCard = memo(function StatCard({ icon: Icon, label, sublabel }) {
  return (
    <div className="card p-3 text-center">
      <Icon size={20} className="mx-auto mb-1 text-primary dark:text-dark-primary" aria-hidden="true" />
      <p className="font-bold text-text-primary dark:text-dark-text-primary text-sm">{label}</p>
      <p className="text-[10px] text-text-secondary dark:text-dark-text-secondary">{sublabel}</p>
    </div>
  )
})

// ─── Main Component ────────────────────────────────────────────────────────────

export default function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const { recipe, loading, error, refetch } = useRecipeDetail(id)
  const { bookmarks, collections, toggleBookmark, addToCollection, createCollection, isBookmarked } = useCollections()
  
  const [activeTab, setActiveTab] = useState('instructions')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [bookmarkState, setBookmarkState] = useState(false)

  // Sync bookmark state
  useEffect(() => {
    setBookmarkState(isBookmarked(id))
  }, [id, isBookmarked, bookmarks])

  // ── Handlers ──
  const handleToggleBookmark = useCallback(() => {
    if (!recipe) return
    const result = toggleBookmark(recipe)
    setBookmarkState(result)
  }, [recipe, toggleBookmark])

  const handleSaveToCollection = useCallback((targetId) => {
    if (!recipe) return
    
    if (targetId === 'bookmarks') {
      handleToggleBookmark()
    } else {
      addToCollection(targetId, {
        idMeal: recipe.idMeal,
        strMeal: recipe.strMeal,
        strMealThumb: recipe.strMealThumb,
        strCategory: recipe.strCategory
      })
    }
    setShowSaveModal(false)
  }, [recipe, handleToggleBookmark, addToCollection])

  const handleCreateAndSave = useCallback((name) => {
    const newCol = createCollection(name)
    if (newCol && recipe) {
      addToCollection(newCol.id, {
        idMeal: recipe.idMeal,
        strMeal: recipe.strMeal,
        strMealThumb: recipe.strMealThumb,
        strCategory: recipe.strCategory
      })
    }
    setShowSaveModal(false)
  }, [recipe, createCollection, addToCollection])

  const handleGoBack = useCallback(() => navigate(-1), [navigate])

  // ── Derived data ──
  const { cookingTime, difficulty } = useMemo(() => {
    if (!recipe) return { cookingTime: '25 min', difficulty: 'Easy' }
    return {
      cookingTime: recipe.parsedInstructions.length > 8 ? '60 min' : 
                   recipe.parsedInstructions.length > 4 ? '40 min' : '25 min',
      difficulty: recipe.parsedIngredients.length > 10 ? 'Hard' :
                  recipe.parsedIngredients.length > 5 ? 'Medium' : 'Easy'
    }
  }, [recipe])

  const stats = useMemo(() => [
    { icon: Clock, label: cookingTime, sublabel: 'Cook Time' },
    { icon: Star, label: '4.8', sublabel: 'Rating' },
    { icon: ChefHat, label: difficulty, sublabel: 'Level' },
    { icon: Users, label: recipe?.parsedIngredients?.length?.toString() || '0', sublabel: 'Ingredients' },
  ], [cookingTime, difficulty, recipe])

  // ── Animation config ──
  const fadeInUp = useMemo(() => ({
    initial: prefersReducedMotion ? {} : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }), [prefersReducedMotion])

  // ─── Loading State ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background dark:bg-dark-background" role="status" aria-label="Loading recipe">
        <LoadingSpinner size={60} />
      </div>
    )
  }

  // ─── Error State ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background dark:bg-dark-background px-6" role="alert">
        <EmptyState message={error} submessage="The recipe might have been removed" />
        <button onClick={refetch} className="btn-primary mt-4 px-6 py-2.5 rounded-xl">Try Again</button>
        <button onClick={handleGoBack} className="mt-3 text-primary dark:text-dark-primary font-medium px-4 py-2">
          Go Back
        </button>
      </div>
    )
  }

  if (!recipe) return null

  // ─── Main Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-background dark:bg-dark-background pb-8">
      
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION - FIXED FOR MOBILE VISIBILITY                            */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative">
        
        {/* Hero Image */}
        <div className="relative h-64 sm:h-72 md:h-96">
          <img
            src={recipe.strMealThumb}
            alt={recipe.strMeal}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background dark:from-dark-background via-black/20 to-transparent" />
        </div>

        {/* 
          FLOATING ACTION BUTTONS - CRITICAL FIX
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          • pt-12 (48px) ensures visibility below status bar / browser chrome
          • pt-safe adds env(safe-area-inset-top) for notched devices  
          • z-50 ensures buttons stay on top
          • Solid bg instead of backdrop-blur (prevents GPU bugs)
          • min-h/w 44px for WCAG touch targets
        */}
        <div 
          className="absolute top-0 left-0 right-0 z-50 flex justify-between items-start px-4 pt-12 sm:pt-6 md:pt-8 pb-4"
          style={{ paddingTop: 'max(3rem, env(safe-area-inset-top) + 0.5rem)' }}
        >
          <ActionButton
            onClick={handleGoBack}
            isActive={false}
            inactiveClass="bg-black/50 text-white hover:bg-black/70"
            activeClass=""
            icon={ArrowLeft}
            label="Go back"
            size={20}
          />
          
          <div className="flex gap-2.5 sm:gap-3">
            <ActionButton
              onClick={() => setShowSaveModal(true)}
              isActive={bookmarkState}
              activeClass="bg-primary dark:bg-dark-primary text-white shadow-lg"
              inactiveClass="bg-black/50 text-white hover:bg-black/70"
              icon={Bookmark}
              label="Save to collection"
              size={20}
            />
            <ActionButton
              onClick={handleToggleBookmark}
              isActive={bookmarkState}
              activeClass="bg-red-500 text-white shadow-lg"
              inactiveClass="bg-black/50 text-white hover:bg-black/70"
              icon={Heart}
              label="Toggle favorite"
              size={20}
            />
          </div>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/90 dark:bg-dark-primary/90 text-white text-xs font-semibold mb-2 sm:mb-3">
              {recipe.strCategory}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-shadow-sm leading-tight mb-1 sm:mb-2">
              {recipe.strMeal}
            </h1>
            <p className="text-white/80 text-sm sm:text-base">
              {recipe.strArea} Cuisine
            </p>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CONTENT SECTION                                                         */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-2 sm:-mt-4 relative z-10">
        
        {/* Quick Stats */}
        <motion.div
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.3 }}
          className="grid grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-6"
        >
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </motion.div>

        {/* YouTube Link */}
        {recipe.strYoutube && (
          <motion.a
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            href={recipe.strYoutube}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mb-5 sm:mb-6 p-3 sm:p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="truncate">Watch Video Tutorial</span>
          </motion.a>
        )}

        {/* Toggle Tabs */}
        <motion.div
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.5 }}
          className="mb-5 sm:mb-6"
        >
          <ToggleTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'ingredients' ? (
            <motion.div
              key="ingredients"
              initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {recipe.parsedIngredients.map((ingredient) => (
                  <IngredientCard key={ingredient.id} ingredient={ingredient} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="instructions"
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-card dark:bg-dark-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-border dark:border-dark-border">
                {recipe.parsedInstructions.length === 0 ? (
                  <EmptyState message="No instructions available" />
                ) : (
                  recipe.parsedInstructions.map((step, index) => (
                    <InstructionStep
                      key={step.id}
                      step={step}
                      isLast={index === recipe.parsedInstructions.length - 1}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Source Link */}
        {recipe.strSource && (
          <div className="mt-5 sm:mt-6 text-center">
            <a
              href={recipe.strSource}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary dark:text-dark-primary hover:underline inline-flex items-center gap-1"
            >
              View Original Source
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* Save to Collection Modal */}
      <SaveToCollectionModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        collections={collections}
        onSave={handleSaveToCollection}
        onCreateNew={handleCreateAndSave}
        isBookmarked={bookmarkState}
      />
    </div>
  )
}