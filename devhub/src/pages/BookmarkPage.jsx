import { useSelector, useDispatch } from 'react-redux'
import { useState, useMemo } from 'react'
import { 
  Bookmark, 
  Trash2, 
  Tag, 
  Search, 
  X, 
  Download, 
  GitFork, 
  Star,
  Plus,
  Filter
} from 'lucide-react'
import { 
  removeBookmark, 
  addTag, 
  removeTag, 
  updateNotes, 
  setActiveCategory 
} from '../store/slices/bookmarksSlice.js'
import { useNotification } from '../context/NotificationContext.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Input from '../components/ui/Input.jsx'
import ExportModal from '../components/ui/ExportModal.jsx'

function BookmarkPage() {
  const dispatch = useDispatch()
  const { showToast } = useNotification()
  const { items, categories, activeCategory } = useSelector((state) => state.bookmarks)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [editingNotes, setEditingNotes] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [newTag, setNewTag] = useState('')
  const [addingTagTo, setAddingTagTo] = useState(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)

  // Get all unique tags from all bookmarks
  const allTags = useMemo(() => {
    const tagSet = new Set()
    items.forEach(item => {
      item.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [items])

  // Combine predefined categories with actual tags
  const filterOptions = useMemo(() => {
    const predefined = ['All', ...categories.filter(c => c !== 'All')]
    const dynamicTags = allTags.filter(tag => !predefined.includes(tag))
    return [...predefined, ...dynamicTags]
  }, [categories, allTags])

  // Filter bookmarks
  const filteredBookmarks = useMemo(() => {
    return items.filter((item) => {
      // Category/Tag filter
      const matchesCategory = activeCategory === 'All' || 
        item.category === activeCategory ||
        item.tags?.includes(activeCategory)
      
      // Search filter - searches name, description, tags, language
      const searchLower = searchTerm.toLowerCase().trim()
      const matchesSearch = !searchLower || 
        item.name?.toLowerCase().includes(searchLower) ||
        item.full_name?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.owner?.login?.toLowerCase().includes(searchLower) ||
        item.language?.toLowerCase().includes(searchLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      
      return matchesCategory && matchesSearch
    })
  }, [items, activeCategory, searchTerm])

  const handleRemove = (id) => {
    dispatch(removeBookmark(id))
    showToast('Bookmark removed', 'info')
  }

  const handleAddTag = (repoId) => {
    if (newTag.trim()) {
      dispatch(addTag({ repoId, tag: newTag.trim() }))
      setNewTag('')
      setAddingTagTo(null)
      showToast(`Tag "${newTag.trim()}" added!`, 'success')
    }
  }

  const handleRemoveTag = (repoId, tag) => {
    dispatch(removeTag({ repoId, tag }))
    showToast('Tag removed', 'info')
  }

  const handleSaveNotes = (repoId) => {
    dispatch(updateNotes({ repoId, notes: noteText }))
    setEditingNotes(null)
    setNoteText('')
    showToast('Notes saved!', 'success')
  }

  const startAddingTag = (repoId) => {
    setAddingTagTo(repoId)
    setNewTag('')
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />
            My Bookmarks
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {items.length} {items.length === 1 ? 'repository' : 'repositories'} saved
          </p>
        </div>
        
        <Button onClick={() => setIsExportModalOpen(true)} variant="secondary" size="sm">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Search by name, description, language, or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => dispatch(setActiveCategory(option))}
                className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 active:scale-95 ${
                  activeCategory === option
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length === 0 ? (
        <EmptyState
          type="bookmarks"
          title={items.length === 0 ? "No bookmarks yet" : "No matches found"}
          description={
            items.length === 0 
              ? "Start exploring and bookmark repositories you find interesting." 
              : "Try adjusting your search or filter."
          }
          action={
            items.length === 0 ? (
              <Button onClick={() => window.location.href = '/search'}>
                Start Searching
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBookmarks.map((repo) => (
            <Card key={repo.id} className="p-5 flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={repo.owner?.avatar_url || `https://github.com/${repo.owner?.login}.png`}
                    alt={repo.owner?.login}
                    className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700"
                  />
                  <div className="min-w-0">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate block transition-colors"
                    >
                      {repo.full_name || `${repo.owner?.login}/${repo.name}`}
                    </a>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{repo.owner?.login}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(repo.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-all duration-200 active:scale-90"
                  aria-label="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 flex-grow leading-relaxed">
                {repo.description || 'No description available'}
              </p>

              {/* Tags Display */}
              {repo.tags && repo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {repo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(repo.id, tag)}
                        className="hover:text-purple-900 dark:hover:text-purple-200 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add Tag Input */}
              {addingTagTo === repo.id ? (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Type tag and press Enter..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag(repo.id)}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    autoFocus
                  />
                  <button
                    onClick={() => handleAddTag(repo.id)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setAddingTagTo(null); setNewTag('') }}
                    className="px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startAddingTag(repo.id)}
                  className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-3 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add tag
                </button>
              )}

              {/* Notes */}
              {editingNotes === repo.id ? (
                <div className="mb-3">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add your notes..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none transition-all"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => handleSaveNotes(repo.id)} size="sm">
                      Save
                    </Button>
                    <Button onClick={() => { setEditingNotes(null); setNoteText('') }} variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  {repo.notes ? (
                    <div 
                      onClick={() => { setEditingNotes(repo.id); setNoteText(repo.notes) }}
                      className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {repo.notes}
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingNotes(repo.id)}
                      className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      + Add notes
                    </button>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span className="tabular-nums">{repo.stargazers_count?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="w-4 h-4" />
                  <span className="tabular-nums">{repo.forks_count?.toLocaleString() || 0}</span>
                </div>
                {repo.language && (
                  <Badge variant="language" language={repo.language}>
                    {repo.language}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Export Modal */}
<ExportModal 
  isOpen={isExportModalOpen} 
  onClose={() => setIsExportModalOpen(false)} 
  bookmarks={items}
  categories={['All', ...categories.filter(c => c !== 'All'), ...allTags]}
/>
    </div>
  )
}

export default BookmarkPage