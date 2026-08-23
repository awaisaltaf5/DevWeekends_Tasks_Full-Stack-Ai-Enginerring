import { FolderOpen, Trash2, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CollectionFolder({ collection, onDelete }) {
  const navigate = useNavigate()
  const { id, name, recipes, thumbnail, createdAt } = collection

  const recipeCount = recipes.length

  return (
    <div className="card group cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={() => navigate(`/saved?collection=${id}`)}
    >
      {/* Thumbnail Grid */}
      <div className="relative h-40 bg-border dark:bg-dark-border overflow-hidden">
        {recipeCount > 0 ? (
          <div className="grid grid-cols-2 gap-0.5 h-full">
            {recipes.slice(0, 4).map((recipe, i) => (
              <div key={i} className="relative overflow-hidden">
                <img
                  src={recipe.strMealThumb}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {recipeCount < 4 && Array(4 - recipeCount).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="bg-border/50 dark:bg-dark-border/50" />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <FolderOpen size={40} className="text-text-secondary/30 dark:text-dark-text-secondary/30" />
          </div>
        )}

        {/* Overlay with count */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
          {recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(id)
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-text-primary dark:text-dark-text-primary truncate">
          {name}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-text-secondary dark:text-dark-text-secondary text-xs">
          <Clock size={12} />
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}