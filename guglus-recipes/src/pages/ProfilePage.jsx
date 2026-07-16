import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Bookmark, FolderOpen, ChefHat, Save } from 'lucide-react'
import { useCollections } from '../hooks/useCollections'
import UserBioCard from '../components/profile/UserBioCard'
import CollectionFolder from '../components/profile/CollectionFolder'
import RecipeCard from '../components/recipe/RecipeCard'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import ThemeToggle from '../components/layout/ThemeToggle'

const TABS = [
  { id: 'collections', label: 'Collections', icon: FolderOpen },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'cooked', label: 'Recipes', icon: ChefHat },
]

// Shared stagger container for grids - purely cosmetic, no logic change
const gridContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}
const gridItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export default function ProfilePage() {
  const {
    bookmarks,
    collections,
    user,
    createCollection,
    deleteCollection,
    updateUser,
    updateAvatar,
    removeAvatar,
  } = useCollections()

  const [activeTab, setActiveTab] = useState('collections')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [editName, setEditName] = useState(user.name)
  const [editBio, setEditBio] = useState(user.bio || '')

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return
    createCollection(newCollectionName.trim())
    setNewCollectionName('')
    setShowCreateModal(false)
  }

  const handleUpdateUser = () => {
    if (!editName.trim()) return
    updateUser({ name: editName.trim(), bio: editBio.trim() })
    localStorage.setItem('guglu-user-name', editName.trim())
    setShowEditModal(false)
  }

  // Update stats
  const userWithStats = {
    ...user,
    savedRecipes: bookmarks.length,
    collectionsCount: collections.length
  }

  return (
    <div className="min-h-screen pb-24 md:pb-10 bg-background dark:bg-dark-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 dark:bg-dark-background/95 backdrop-blur-lg border-b border-border/50 dark:border-dark-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-text-primary dark:text-dark-text-primary">
            Profile
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {/* User Bio with Image Upload */}
        <UserBioCard 
          user={userWithStats} 
          onEdit={() => {
            setEditName(user.name)
            setEditBio(user.bio || '')
            setShowEditModal(true)
          }}
          onImageChange={updateAvatar}
          onImageRemove={removeAvatar}
        />

        {/* Tabs - horizontally scrollable on small screens so it never wraps/overflows */}
        <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 w-max sm:w-auto min-w-full sm:min-w-0">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-colors duration-150 ${
                    isActive
                      ? 'bg-primary dark:bg-dark-primary text-white dark:text-dark-background shadow-md'
                      : 'bg-card dark:bg-dark-card border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:border-primary/40 dark:hover:border-dark-primary/40'
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{label}</span>
                  {id === 'collections' && collections.length > 0 && (
                    <span className={`ml-0.5 text-xs font-semibold ${isActive ? 'text-white/80 dark:text-dark-background/70' : 'text-text-secondary/70 dark:text-dark-text-secondary/70'}`}>
                      {collections.length}
                    </span>
                  )}
                  {id === 'saved' && bookmarks.length > 0 && (
                    <span className={`ml-0.5 text-xs font-semibold ${isActive ? 'text-white/80 dark:text-dark-background/70' : 'text-text-secondary/70 dark:text-dark-text-secondary/70'}`}>
                      {bookmarks.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Collections Tab */}
          {activeTab === 'collections' && (
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-base sm:text-lg font-bold text-text-primary dark:text-dark-text-primary">
                  My Collections
                </h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-primary dark:bg-dark-primary text-white dark:text-dark-background text-xs sm:text-sm font-semibold hover:shadow-lg active:scale-[0.97] transition-all shrink-0"
                >
                  <Plus size={16} />
                  <span className="hidden xs:inline sm:inline">New Collection</span>
                  <span className="inline xs:hidden sm:hidden">New</span>
                </button>
              </div>

              {collections.length === 0 ? (
                <EmptyState 
                  message="No collections yet" 
                  submessage="Create your first collection to organize recipes" 
                />
              ) : (
                <motion.div
                  variants={gridContainer}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
                >
                  {collections.map(collection => (
                    <motion.div key={collection.id} variants={gridItem}>
                      <CollectionFolder
                        collection={collection}
                        onDelete={deleteCollection}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* Saved Tab */}
          {activeTab === 'saved' && (
            <div>
              <h2 className="text-base sm:text-lg font-bold text-text-primary dark:text-dark-text-primary mb-4">
                Saved Recipes
              </h2>
              {bookmarks.length === 0 ? (
                <EmptyState 
                  message="No saved recipes" 
                  submessage="Bookmark recipes you love to see them here" 
                />
              ) : (
                <motion.div
                  variants={gridContainer}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
                >
                  {bookmarks.map(recipe => (
                    <motion.div key={recipe.idMeal} variants={gridItem}>
                      <RecipeCard recipe={recipe} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          {/* Recipes/Cooked Tab */}
          {activeTab === 'cooked' && (
            <div>
              <h2 className="text-base sm:text-lg font-bold text-text-primary dark:text-dark-text-primary mb-4">
                Recipes You've Cooked
              </h2>
              <EmptyState 
                message="Coming Soon" 
                submessage="Track your cooking history here" 
              />
            </div>
          )}
        </motion.div>
      </main>

      {/* Create Collection Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Collection"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
              Collection Name
            </label>
            <input
              type="text"
              placeholder="e.g., Weekend Dinners"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              className="input-field"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
              autoFocus
            />
          </div>
          <button
            onClick={handleCreateCollection}
            disabled={!newCollectionName.trim()}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            Create Collection
          </button>
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
              Your Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
              Bio
            </label>
            <textarea
              placeholder="Tell us about yourself..."
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="input-field resize-none"
              rows={3}
            />
          </div>
          <button
            onClick={handleUpdateUser}
            disabled={!editName.trim()}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </Modal>
    </div>
  )
}