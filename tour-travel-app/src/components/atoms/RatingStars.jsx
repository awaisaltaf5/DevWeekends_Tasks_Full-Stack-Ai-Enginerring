import { Star } from 'lucide-react'

export default function RatingStars({ rating, reviews, showCount = true }) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {/* Full Stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star 
            key={`full-${i}`} 
            className="w-4 h-4 fill-amber-400 text-amber-400" 
          />
        ))}
        
        {/* Half Star */}
        {hasHalfStar && (
          <div className="relative w-4 h-4">
            <Star className="w-4 h-4 text-gray-300 dark:text-gray-600 absolute" />
            <div className="overflow-hidden w-1/2 absolute">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
        )}
        
        {/* Empty Stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star 
            key={`empty-${i}`} 
            className="w-4 h-4 text-gray-300 dark:text-gray-600" 
          />
        ))}
      </div>
      
      {/* Rating Number */}
      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{rating}</span>
      
      {/* Reviews Count */}
      {showCount && reviews && (
        <span className="text-sm text-gray-500 dark:text-gray-400">({reviews})</span>
      )}
    </div>
  )
}