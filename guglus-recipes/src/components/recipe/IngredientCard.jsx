import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

export default function IngredientCard({ ingredient }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-card dark:bg-dark-card border border-border dark:border-dark-border hover:shadow-md transition-all duration-200">
      {/* Ingredient Image */}
      <div className="w-14 h-14 rounded-xl bg-background dark:bg-dark-background flex items-center justify-center overflow-hidden shrink-0">
        {!imgError ? (
          <img
            src={ingredient.image}
            alt={ingredient.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <AlertCircle size={20} className="text-text-secondary dark:text-dark-text-secondary" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-text-primary dark:text-dark-text-primary text-sm truncate">
          {ingredient.name}
        </h4>
        <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5">
          {ingredient.amount}
        </p>
      </div>
    </div>
  )
}