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
    <div className="min-h-screen pb-24 md:pb-8 bg-background dark:bg-dark-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 dark:bg-dark-background/80 backdrop-blur-lg border-b border-border/50 dark:border-dark-border/50">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">
            Profile
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
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

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === id
                  ? 'bg-primary dark:bg-dark-primary text-white dark:text-dark-background shadow-md'
                  : 'bg-card dark:bg-dark-card border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-text-primary dark:text-dark-text-primary">
                  My Collections
                </h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary dark:bg-dark-primary text-white dark:text-dark-background text-sm font-medium hover:shadow-lg transition-shadow"
                >
                  <Plus size={16} />
                  New Collection
                </button>
              </div>

              {collections.length === 0 ? (
                <EmptyState 
                  message="No collections yet" 
                  submessage="Create your first collection to organize recipes" 
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {collections.map(collection => (
                    <CollectionFolder
                      key={collection.id}
                      collection={collection}
                      onDelete={deleteCollection}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Tab */}
          {activeTab === 'saved' && (
            <div>
              <h2 className="text-lg font-bold text-text-primary dark:text-dark-text-primary mb-4">
                Saved Recipes
              </h2>
              {bookmarks.length === 0 ? (
                <EmptyState 
                  message="No saved recipes" 
                  submessage="Bookmark recipes you love to see them here" 
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookmarks.map(recipe => (
                    <RecipeCard key={recipe.idMeal} recipe={recipe} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recipes/Cooked Tab */}
          {activeTab === 'cooked' && (
            <div>
              <h2 className="text-lg font-bold text-text-primary dark:text-dark-text-primary mb-4">
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
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
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
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </Modal>
    </div>
  )
}