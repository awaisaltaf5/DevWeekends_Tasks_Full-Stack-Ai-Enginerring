import { useMemo } from 'react'
import { Clock, Star, Flame, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate()

  // Parse cooking time from instructions or default
  const cookingTime = recipe.strTags?.includes('quick') ? '20 min' : '40 min'
  const difficulty = recipe.strCategory === 'Dessert' ? 'Easy' : 'Medium'

  // Stable per-recipe rating - was Math.random() on every render, which made
  // the number flicker/change any time this card re-rendered
  const rating = useMemo(() => (4 + Math.random()).toFixed(1), [recipe.idMeal])

  return (
    <Card 
      className="group"
      onClick={() => navigate(`/recipe/${recipe.idMeal}`)}
    >
      {/* Image */}
      <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
        <img
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Rating Badge */}
        <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-[11px] sm:text-xs font-semibold">
          <Star size={11} className="text-yellow-400 fill-yellow-400 sm:w-3 sm:h-3" />
          {rating}
        </div>

        {/* Category Tag */}
        <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3">
          <span className="px-2.5 sm:px-3 py-1 rounded-full bg-primary/90 dark:bg-dark-primary/90 text-white text-[11px] sm:text-xs font-medium">
            {recipe.strCategory}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4">
        <h3 className="font-bold text-text-primary dark:text-dark-text-primary text-base sm:text-lg mb-1.5 sm:mb-2 line-clamp-1">
          {recipe.strMeal}
        </h3>

        <div className="flex items-center justify-between gap-2 text-text-secondary dark:text-dark-text-secondary text-xs sm:text-sm">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <span className="flex items-center gap-1 shrink-0">
              <Clock size={13} className="sm:w-3.5 sm:h-3.5" />
              {cookingTime}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Flame size={13} className="sm:w-3.5 sm:h-3.5" />
              {difficulty}
            </span>
          </div>
          {/* Visible at reduced opacity by default so touch/mobile users get the
              affordance too, not just mouse-hover desktop users */}
          <ChevronRight size={17} className="text-primary dark:text-dark-primary opacity-40 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
      </div>
    </Card>
  )
}