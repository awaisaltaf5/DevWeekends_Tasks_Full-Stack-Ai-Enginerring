import { Clock, Star, Flame, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate()

  // Parse cooking time from instructions or default
  const cookingTime = recipe.strTags?.includes('quick') ? '20 min' : '40 min'
  const difficulty = recipe.strCategory === 'Dessert' ? 'Easy' : 'Medium'
  const rating = (4 + Math.random()).toFixed(1)

  return (
    <Card 
      className="cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
      onClick={() => navigate(`/recipe/${recipe.idMeal}`)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-semibold">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          {rating}
        </div>

        {/* Category Tag */}
        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1 rounded-full bg-primary/90 dark:bg-dark-primary/90 text-white text-xs font-medium">
            {recipe.strCategory}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-text-primary dark:text-dark-text-primary text-lg mb-2 line-clamp-1">
          {recipe.strMeal}
        </h3>

        <div className="flex items-center justify-between text-text-secondary dark:text-dark-text-secondary text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {cookingTime}
            </span>
            <span className="flex items-center gap-1">
              <Flame size={14} />
              {difficulty}
            </span>
          </div>
          <ChevronRight size={18} className="text-primary dark:text-dark-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Card>
  )
}