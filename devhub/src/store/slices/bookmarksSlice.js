import { createSlice } from '@reduxjs/toolkit'

const loadBookmarks = () => {
  try {
    const saved = localStorage.getItem('devhub-bookmarks')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const initialState = {
  items: loadBookmarks(),
  categories: ['All', 'Learning', 'Work', 'Inspiration', 'Tools'],
  activeCategory: 'All',
  allTags: [], // Will be computed from bookmarks
}

const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark: (state, action) => {
      const repo = action.payload
      const exists = state.items.some(item => item.id === repo.id)
      
      if (!exists) {
        state.items.push({
          ...repo,
          savedAt: new Date().toISOString(),
          tags: [],
          notes: '',
          category: 'All',
        })
        persistBookmarks(state.items)
      }
    },
    
    removeBookmark: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      persistBookmarks(state.items)
    },
    
    addTag: (state, action) => {
      const { repoId, tag } = action.payload
      const item = state.items.find(item => item.id === repoId)
      if (item && !item.tags.includes(tag)) {
        item.tags.push(tag)
        persistBookmarks(state.items)
      }
    },
    
    removeTag: (state, action) => {
      const { repoId, tag } = action.payload
      const item = state.items.find(item => item.id === repoId)
      if (item) {
        item.tags = item.tags.filter(t => t !== tag)
        persistBookmarks(state.items)
      }
    },
    
    updateNotes: (state, action) => {
      const { repoId, notes } = action.payload
      const item = state.items.find(item => item.id === repoId)
      if (item) {
        item.notes = notes
        persistBookmarks(state.items)
      }
    },
    
    setCategory: (state, action) => {
      const { repoId, category } = action.payload
      const item = state.items.find(item => item.id === repoId)
      if (item && state.categories.includes(category)) {
        item.category = category
        persistBookmarks(state.items)
      }
    },
    
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload
    },
    
    exportBookmarks: (state) => {
      return state
    },
  },
})

function persistBookmarks(items) {
  localStorage.setItem('devhub-bookmarks', JSON.stringify(items))
}

export const {
  addBookmark,
  removeBookmark,
  addTag,
  removeTag,
  updateNotes,
  setCategory,
  setActiveCategory,
  exportBookmarks,
} = bookmarksSlice.actions

export default bookmarksSlice.reducer