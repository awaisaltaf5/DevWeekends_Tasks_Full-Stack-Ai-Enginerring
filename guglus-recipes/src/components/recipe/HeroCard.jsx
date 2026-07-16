import { Clock, Star, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function HeroCard({ recipe }) {
  const navigate = useNavigate()
  if (!recipe) return null

  return (
    <div 
      onClick={() => navigate(`/recipe/${recipe.idMeal}`)}
      className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-xl hover:shadow-2xl transition-all duration-300"
    >
      {/* Background Image */}
      <img
        src={recipe.strMealThumb}
        alt={recipe.strMeal}
        className="w-full h-64 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold uppercase tracking-wide">
            Featured
          </span>
          <span className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
            <Star size={14} className="fill-yellow-400" />
            4.9
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {recipe.strMeal}
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              35 min
            </span>
            <span>{recipe.strArea} Cuisine</span>
          </div>
          
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowRight size={18} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}