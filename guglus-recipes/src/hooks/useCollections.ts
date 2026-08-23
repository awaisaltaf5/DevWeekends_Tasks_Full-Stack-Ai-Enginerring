import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEYS = {
  bookmarks: 'guglu-bookmarks',
  collections: 'guglu-collections',
  user: 'guglu-user'
}

export function useCollections() {
  const [bookmarks, setBookmarks] = useState([])
  const [collections, setCollections] = useState([])
  const [user, setUser] = useState({ name: 'Chef', tier: 'Newbie Chef', avatar: '', bio: '' })

  // Load from localStorage on mount
  useEffect(() => {
    const savedBookmarks = JSON.parse(localStorage.getItem(STORAGE_KEYS.bookmarks) || '[]')
    const savedCollections = JSON.parse(localStorage.getItem(STORAGE_KEYS.collections) || '[]')
    const savedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || '{}')
    
    setBookmarks(savedBookmarks)
    setCollections(savedCollections)
    setUser(prev => ({ ...prev, ...savedUser }))
  }, [])

  // Save bookmarks
  const saveBookmarks = useCallback((newBookmarks) => {
    setBookmarks(newBookmarks)
    localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(newBookmarks))
  }, [])

  // Save collections
  const saveCollections = useCallback((newCollections) => {
    setCollections(newCollections)
    localStorage.setItem(STORAGE_KEYS.collections, JSON.stringify(newCollections))
  }, [])

  // Save user
  const saveUser = useCallback((newUser) => {
    setUser(newUser)
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(newUser))
  }, [])

  // Toggle bookmark
  const toggleBookmark = useCallback((recipe) => {
    const exists = bookmarks.find(b => b.idMeal === recipe.idMeal)
    let updated
    
    if (exists) {
      updated = bookmarks.filter(b => b.idMeal !== recipe.idMeal)
    } else {
      updated = [...bookmarks, {
        idMeal: recipe.idMeal,
        strMeal: recipe.strMeal,
        strMealThumb: recipe.strMealThumb,
        strCategory: recipe.strCategory,
        savedAt: new Date().toISOString()
      }]
    }
    
    saveBookmarks(updated)
    return !exists
  }, [bookmarks, saveBookmarks])

  const isBookmarked = useCallback((recipeId) => {
    return bookmarks.some(b => b.idMeal === recipeId)
  }, [bookmarks])

  // Create collection
  const createCollection = useCallback((name, description = '') => {
    const newCollection = {
      id: Date.now().toString(),
      name,
      description,
      recipes: [],
      createdAt: new Date().toISOString(),
      thumbnail: ''
    }
    
    const updated = [...collections, newCollection]
    saveCollections(updated)
    return newCollection
  }, [collections, saveCollections])

  // Add recipe to collection
  const addToCollection = useCallback((collectionId, recipe) => {
    const updated = collections.map(col => {
      if (col.id === collectionId) {
        const exists = col.recipes.some(r => r.idMeal === recipe.idMeal)
        if (exists) return col
        
        return {
          ...col,
          recipes: [...col.recipes, recipe],
          thumbnail: col.thumbnail || recipe.strMealThumb
        }
      }
      return col
    })
    
    saveCollections(updated)
  }, [collections, saveCollections])

  // Remove recipe from collection
  const removeFromCollection = useCallback((collectionId, recipeId) => {
    const updated = collections.map(col => {
      if (col.id === collectionId) {
        const filtered = col.recipes.filter(r => r.idMeal !== recipeId)
        return {
          ...col,
          recipes: filtered,
          thumbnail: filtered[0]?.strMealThumb || ''
        }
      }
      return col
    })
    
    saveCollections(updated)
  }, [collections, saveCollections])

  // Delete collection
  const deleteCollection = useCallback((collectionId) => {
    const updated = collections.filter(c => c.id !== collectionId)
    saveCollections(updated)
  }, [collections, saveCollections])

  // Update user profile (name, bio, etc.)
  const updateUser = useCallback((updates) => {
    const updated = { ...user, ...updates }
    saveUser(updated)
  }, [user, saveUser])

  // Update avatar (profile picture)
  const updateAvatar = useCallback((avatarBase64) => {
    const updated = { ...user, avatar: avatarBase64 }
    saveUser(updated)
  }, [user, saveUser])

  // Remove avatar
  const removeAvatar = useCallback(() => {
    const updated = { ...user, avatar: '' }
    saveUser(updated)
  }, [user, saveUser])

  return {
    bookmarks,
    collections,
    user,
    toggleBookmark,
    isBookmarked,
    createCollection,
    addToCollection,
    removeFromCollection,
    deleteCollection,
    updateUser,
    updateAvatar,
    removeAvatar,
  }
}