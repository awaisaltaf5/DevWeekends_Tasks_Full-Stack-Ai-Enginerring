import { Clock, Star, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function HeroCard({ recipe }) {
  const navigate = useNavigate()
  if (!recipe) return null

  const goToRecipe = () => navigate(`/recipe/${recipe.idMeal}`)

  return (
    <div 
      onClick={goToRecipe}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          goToRecipe()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View recipe: ${recipe.strMeal}`}
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer group shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-offset-dark-background"
    >
      {/* Background Image */}
      <img
        src={recipe.strMealThumb}
        alt={recipe.strMeal}
        className="w-full h-52 xs:h-60 sm:h-72 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
          <span className="px-2.5 sm:px-3 py-1 rounded-full bg-primary text-white text-[10px] sm:text-xs font-bold uppercase tracking-wide">
            Featured
          </span>
          <span className="flex items-center gap-1 text-yellow-400 text-xs sm:text-sm font-semibold">
            <Star size={13} className="fill-yellow-400 sm:w-3.5 sm:h-3.5" />
            4.9
          </span>
        </div>

        <h2 className="text-xl xs:text-2xl md:text-3xl font-bold text-white mb-1.5 sm:mb-2 line-clamp-2 leading-tight">
          {recipe.strMeal}
        </h2>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 text-white/80 text-xs sm:text-sm min-w-0">
            <span className="flex items-center gap-1 shrink-0">
              <Clock size={13} className="sm:w-3.5 sm:h-3.5" />
              35 min
            </span>
            <span className="truncate">{recipe.strArea} Cuisine</span>
          </div>
          
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
            <ArrowRight size={17} className="text-white sm:w-[18px] sm:h-[18px]" />
          </div>
        </div>
      </div>
    </div>
  )
}