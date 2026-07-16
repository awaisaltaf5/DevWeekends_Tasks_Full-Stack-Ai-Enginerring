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
    <div className="card p-4 sm:p-6 relative">
      {/* Image Options Modal */}
      {showImageOptions && (
        <div
          className="absolute inset-0 z-20 bg-card/95 dark:bg-dark-card/95 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center gap-2.5 sm:gap-3 p-5 sm:p-6"
          onKeyDown={(e) => e.key === 'Escape' && setShowImageOptions(false)}
        >
          <p className="text-text-primary dark:text-dark-text-primary font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Profile Picture</p>
          <button
            onClick={handleChangeImage}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary dark:bg-dark-primary text-white dark:text-dark-background font-medium text-xs sm:text-sm w-full justify-center active:scale-[0.98] transition-transform"
          >
            <Camera size={16} />
            Change Photo
          </button>
          <button
            onClick={handleRemoveImage}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500/10 text-red-500 font-medium text-xs sm:text-sm w-full justify-center hover:bg-red-500/20 active:scale-[0.98] transition-all"
          >
            <Trash2 size={16} />
            Remove Photo
          </button>
          <button
            onClick={() => setShowImageOptions(false)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary font-medium text-xs sm:text-sm w-full justify-center active:scale-[0.98] transition-transform"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Avatar with click to change */}
        <div 
          className="relative group cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:focus-visible:ring-dark-primary/60 rounded-2xl" 
          onClick={handleImageClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleImageClick()
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={user.avatar ? 'Change or remove profile picture' : 'Upload profile picture'}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 dark:bg-dark-primary/10 flex items-center justify-center overflow-hidden border-2 border-border dark:border-dark-border group-hover:border-primary dark:group-hover:border-dark-primary transition-colors">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl sm:text-3xl font-bold text-primary dark:text-dark-primary">
                {user.name[0]?.toUpperCase()}
              </span>
            )}
          </div>
          
          {/* Camera overlay on hover (desktop) */}
          <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={20} className="text-white sm:w-[22px] sm:h-[22px]" />
          </div>

          {/* Persistent small camera cue so touch users know it's tappable without a hover state */}
          <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center border-2 border-card dark:border-dark-card sm:hidden">
            <Camera size={10} className="text-white" />
          </div>

          {/* Tier badge */}
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full ${tier.color} flex items-center justify-center border-2 border-card dark:border-dark-card`}>
            <TierIcon size={12} className="text-white sm:w-[14px] sm:h-[14px]" />
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
          <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-dark-text-primary truncate">
            {user.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium text-white ${tier.color}`}>
              {user.tier}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary dark:text-dark-text-secondary mt-1 line-clamp-2">
            {user.bio || 'Passionate about cooking new recipes!'}
          </p>
        </div>

        {/* Edit Button */}
        <button
          onClick={onEdit}
          aria-label="Edit profile"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-border dark:bg-dark-border flex items-center justify-center text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-primary active:scale-95 transition-all shrink-0"
        >
          <Edit3 size={17} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-border dark:border-dark-border">
        <div className="text-center">
          <p className="text-xl sm:text-2xl font-bold text-text-primary dark:text-dark-text-primary">
            {user.recipesCooked || 0}
          </p>
          <p className="text-[10px] sm:text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
            Recipes Cooked
          </p>
        </div>
        <div className="text-center">
          <p className="text-xl sm:text-2xl font-bold text-text-primary dark:text-dark-text-primary">
            {user.collectionsCount || 0}
          </p>
          <p className="text-[10px] sm:text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
            Collections
          </p>
        </div>
        <div className="text-center">
          <p className="text-xl sm:text-2xl font-bold text-text-primary dark:text-dark-text-primary">
            {user.savedRecipes || 0}
          </p>
          <p className="text-[10px] sm:text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
            Saved Recipes
          </p>
        </div>
      </div>
    </div>
  )
}