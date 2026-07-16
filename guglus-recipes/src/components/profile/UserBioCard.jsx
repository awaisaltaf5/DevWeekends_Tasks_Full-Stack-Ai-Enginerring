import { useRef, useState } from 'react'
import { ChefHat, Edit3, Award, Camera, Trash2, X } from 'lucide-react'

const TIERS = [
  { name: 'Newbie Chef', color: 'bg-gray-400', icon: ChefHat },
  { name: 'Home Cook', color: 'bg-success', icon: ChefHat },
  { name: 'Sous Chef', color: 'bg-primary', icon: Award },
  { name: 'Master Chef', color: 'bg-yellow-500', icon: Award },
]

export default function UserBioCard({ user, onEdit, onImageChange, onImageRemove }) {
  const fileInputRef = useRef(null)
  const [showImageOptions, setShowImageOptions] = useState(false)
  const tier = TIERS.find(t => t.name === user.tier) || TIERS[0]
  const TierIcon = tier.icon

  const handleImageClick = () => {
    if (user.avatar) {
      setShowImageOptions(true)
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      onImageChange(reader.result)
      setShowImageOptions(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    onImageRemove()
    setShowImageOptions(false)
  }

  const handleChangeImage = () => {
    fileInputRef.current?.click()
    setShowImageOptions(false)
  }

  return (
    <div className="card p-6 relative">
      {/* Image Options Modal */}
      {showImageOptions && (
        <div className="absolute inset-0 z-20 bg-card/95 dark:bg-dark-card/95 rounded-3xl flex flex-col items-center justify-center gap-3 p-6">
          <p className="text-text-primary dark:text-dark-text-primary font-semibold mb-2">Profile Picture</p>
          <button
            onClick={handleChangeImage}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary dark:bg-dark-primary text-white dark:text-dark-background font-medium text-sm w-full justify-center"
          >
            <Camera size={16} />
            Change Photo
          </button>
          <button
            onClick={handleRemoveImage}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500/10 text-red-500 font-medium text-sm w-full justify-center hover:bg-red-500/20 transition-colors"
          >
            <Trash2 size={16} />
            Remove Photo
          </button>
          <button
            onClick={() => setShowImageOptions(false)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary font-medium text-sm w-full justify-center"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Avatar with click to change */}
        <div 
          className="relative group cursor-pointer" 
          onClick={handleImageClick}
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 dark:bg-dark-primary/10 flex items-center justify-center overflow-hidden border-2 border-border dark:border-dark-border group-hover:border-primary dark:group-hover:border-dark-primary transition-colors">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-primary dark:text-dark-primary">
                {user.name[0]?.toUpperCase()}
              </span>
            )}
          </div>
          
          {/* Camera overlay on hover */}
          <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={22} className="text-white" />
          </div>

          {/* Tier badge */}
          <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full ${tier.color} flex items-center justify-center border-2 border-card dark:border-dark-card`}>
            <TierIcon size={14} className="text-white" />
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary truncate">
            {user.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${tier.color}`}>
              {user.tier}
            </span>
          </div>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1 line-clamp-2">
            {user.bio || 'Passionate about cooking new recipes!'}
          </p>
        </div>

        {/* Edit Button */}
        <button
          onClick={onEdit}
          className="w-10 h-10 rounded-xl bg-border dark:bg-dark-border flex items-center justify-center text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-primary transition-colors shrink-0"
        >
          <Edit3 size={18} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border dark:border-dark-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
            {user.recipesCooked || 0}
          </p>
          <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
            Recipes Cooked
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
            {user.collectionsCount || 0}
          </p>
          <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
            Collections
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
            {user.savedRecipes || 0}
          </p>
          <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
            Saved Recipes
          </p>
        </div>
      </div>
    </div>
  )
}