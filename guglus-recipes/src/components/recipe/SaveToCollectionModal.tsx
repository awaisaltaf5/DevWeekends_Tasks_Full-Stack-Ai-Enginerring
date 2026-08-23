import { useState } from 'react'
import { motion } from 'framer-motion'
import { FolderPlus, Plus, Check, Bookmark } from 'lucide-react'
import Modal from '../ui/Modal'

export default function SaveToCollectionModal({ 
  isOpen, 
  onClose, 
  collections, 
  onSave, 
  onCreateNew,
  isBookmarked 
}) {
  const [showCreateInput, setShowCreateInput] = useState(false)
  const [newName, setNewName] = useState('')

  const handleCreateAndSave = () => {
    if (!newName.trim()) return
    onCreateNew(newName.trim())
    setNewName('')
    setShowCreateInput(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save to Collection">
      <div className="space-y-3">
        {/* Bookmark option */}
        <button
          onClick={() => onSave('bookmarks')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
            isBookmarked
              ? 'border-primary dark:border-dark-primary bg-primary/5 dark:bg-dark-primary/5'
              : 'border-border dark:border-dark-border hover:border-primary dark:hover:border-dark-primary'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isBookmarked ? 'bg-primary dark:bg-dark-primary' : 'bg-border dark:bg-dark-border'
          }`}>
            <Bookmark size={18} className={isBookmarked ? 'text-white fill-white' : 'text-text-secondary'} />
          </div>
          <div className="text-left flex-1">
            <p className="font-medium text-text-primary dark:text-dark-text-primary">Saved Recipes</p>
            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Quick access to all favorites</p>
          </div>
          {isBookmarked && <Check size={18} className="text-primary dark:text-dark-primary" />}
        </button>

        {/* Collections list */}
        {collections.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
              Your Collections
            </p>
            {collections.map(collection => (
              <motion.button
                key={collection.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSave(collection.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-border dark:border-dark-border hover:border-primary dark:hover:border-dark-primary transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-border dark:bg-dark-border flex items-center justify-center overflow-hidden">
                  {collection.thumbnail ? (
                    <img src={collection.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FolderPlus size={18} className="text-text-secondary" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-text-primary dark:text-dark-text-primary text-sm">{collection.name}</p>
                  <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                    {collection.recipes.length} recipes
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* Create new collection */}
        {!showCreateInput ? (
          <button
            onClick={() => setShowCreateInput(true)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-border dark:border-dark-border hover:border-primary dark:hover:border-dark-primary transition-all text-text-secondary dark:text-dark-text-secondary"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Create New Collection</span>
          </button>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Collection name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input-field"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateAndSave()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateAndSave}
                disabled={!newName.trim()}
                className="flex-1 btn-primary text-sm py-2 disabled:opacity-50"
              >
                Create & Save
              </button>
              <button
                onClick={() => {
                  setShowCreateInput(false)
                  setNewName('')
                }}
                className="px-4 py-2 rounded-xl border border-border dark:border-dark-border text-text-secondary dark:text-dark-text-secondary text-sm hover:bg-border dark:hover:bg-dark-border transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}