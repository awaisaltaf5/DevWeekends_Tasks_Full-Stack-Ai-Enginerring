import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Clock, Star, ChefHat, Users, Bookmark } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRecipeDetail } from '../hooks/useRecipeDetail'
import { useCollections } from '../hooks/useCollections'
import ToggleTabs from '../components/recipe/ToggleTabs'
import IngredientCard from '../components/recipe/IngredientCard'
import InstructionStep from '../components/recipe/InstructionStep'
import SaveToCollectionModal from '../components/recipe/SaveToCollectionModal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

export default function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { recipe, loading, error, refetch } = useRecipeDetail(id)
  const { bookmarks, collections, toggleBookmark, addToCollection, createCollection, isBookmarked } = useCollections()
  
  const [activeTab, setActiveTab] = useState('instructions')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [bookmarkState, setBookmarkState] = useState(false)

  // Sync bookmark state with collections
  useEffect(() => {
    setBookmarkState(isBookmarked(id))
  }, [id, isBookmarked, bookmarks])

  const handleToggleBookmark = () => {
    if (!recipe) return
    const result = toggleBookmark(recipe)
    setBookmarkState(result)
  }

  const handleSaveToCollection = (targetId) => {
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
  }

  const handleCreateAndSave = (name) => {
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
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background">
        <LoadingSpinner size={60} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-dark-background px-6 text-center">
        <EmptyState message={error} submessage="The recipe might have been removed" />
        <button onClick={refetch} className="btn-primary mt-4 w-full max-w-xs">Try Again</button>
        <button onClick={() => navigate(-1)} className="mt-3 text-primary dark:text-dark-primary font-medium text-sm">
          Go Back
        </button>
      </div>
    )
  }

  if (!recipe) return null

  // Estimate cooking time based on complexity
  const cookingTime = recipe.parsedInstructions.length > 8 ? '60 min' : 
                      recipe.parsedInstructions.length > 4 ? '40 min' : '25 min'
  const difficulty = recipe.parsedIngredients.length > 10 ? 'Hard' :
                     recipe.parsedIngredients.length > 5 ? 'Medium' : 'Easy'

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background pb-8">
      {/* Hero Image Section */}
      <div className="relative">
        <div className="relative h-64 xs:h-72 sm:h-80 md:h-96">
          <img
            src={recipe.strMealThumb}
            alt={recipe.strMeal}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background dark:from-dark-background via-transparent to-transparent" />
        </div>

        {/* Floating Action Buttons */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 active:scale-95 transition-all"
          >
            <ArrowLeft size={19} className="sm:w-5 sm:h-5" />
          </button>
          
          <div className="flex gap-2.5 sm:gap-3">
            <button
              onClick={() => setShowSaveModal(true)}
              aria-label="Save to collection"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full backdrop-blur-md flex items-center justify-center active:scale-95 transition-all duration-200 ${
                bookmarkState 
                  ? 'bg-primary dark:bg-dark-primary text-white' 
                  : 'bg-black/30 text-white hover:bg-black/50'
              }`}
            >
              <Bookmark size={19} className={`sm:w-5 sm:h-5 ${bookmarkState ? 'fill-white' : ''}`} />
            </button>
            <button
              onClick={handleToggleBookmark}
              aria-label="Toggle favorite"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full backdrop-blur-md flex items-center justify-center active:scale-95 transition-all duration-200 ${
                bookmarkState 
                  ? 'bg-red-500 text-white' 
                  : 'bg-black/30 text-white hover:bg-black/50'
              }`}
            >
              <Heart size={19} className={`sm:w-5 sm:h-5 ${bookmarkState ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-block px-2.5 sm:px-3 py-1 rounded-full bg-primary/90 text-white text-[11px] sm:text-xs font-semibold mb-2 sm:mb-3">
              {recipe.strCategory}
            </span>
            <h1 className="text-2xl xs:text-3xl md:text-4xl font-bold text-text-primary dark:text-dark-text-primary mb-1.5 sm:mb-2 leading-tight">
              {recipe.strMeal}
            </h1>
            <p className="text-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm">
              {recipe.strArea} Cuisine
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-2 relative z-10">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 xs:grid-cols-4 gap-2.5 sm:gap-3 mb-5 sm:mb-6"
        >
          {[
            { icon: Clock, label: cookingTime, sublabel: 'Cook Time' },
            { icon: Star, label: '4.8', sublabel: 'Rating' },
            { icon: ChefHat, label: difficulty, sublabel: 'Level' },
            { icon: Users, label: recipe.parsedIngredients.length.toString(), sublabel: 'Ingredients' },
          ].map((stat, i) => (
            <div key={i} className="card p-2.5 sm:p-3 text-center">
              <stat.icon size={19} className="mx-auto mb-1 text-primary dark:text-dark-primary" />
              <p className="font-bold text-text-primary dark:text-dark-text-primary text-xs sm:text-sm truncate">{stat.label}</p>
              <p className="text-[9px] sm:text-[10px] text-text-secondary dark:text-dark-text-secondary">{stat.sublabel}</p>
            </div>
          ))}
        </motion.div>

        {/* YouTube Link if available */}
        {recipe.strYoutube && (
          <motion.a
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            href={recipe.strYoutube}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mb-5 sm:mb-6 p-3.5 sm:p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-[0.99] transition-all"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>Watch Video Tutorial</span>
          </motion.a>
        )}

        {/* Toggle Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-5 sm:mb-6"
        >
          <ToggleTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'ingredients' ? (
            <motion.div
              key="ingredients"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {recipe.parsedIngredients.map((ingredient) => (
                  <IngredientCard key={ingredient.id} ingredient={ingredient} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
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
          <div className="mt-6 text-center">
            <a
              href={recipe.strSource}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-primary dark:text-dark-primary hover:underline"
            >
              View Original Source
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