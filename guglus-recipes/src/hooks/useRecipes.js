import { useState, useEffect, useCallback } from 'react'
import { mealdb } from '../services/api'
import { searchEdamamRecipes, transformEdamamRecipe } from '../services/edamam'

export function useRecipes() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeFilters, setActiveFilters] = useState({})
  const [usingEdamam, setUsingEdamam] = useState(false)

  // Fetch from TheMealDB (default)
  const fetchRecipes = useCallback(async (category = 'All') => {
    setLoading(true)
    setError(null)
    setUsingEdamam(false)
    setActiveFilters({})
    
    try {
      let meals = []
      
      if (category === 'All') {
        const promises = Array(8).fill(null).map(() => mealdb.random())
        const results = await Promise.all(promises)
        meals = results.map(r => r.data.meals[0]).filter(Boolean)
        const seen = new Set()
        meals = meals.filter(meal => {
          if (seen.has(meal.idMeal)) return false
          seen.add(meal.idMeal)
          return true
        })
      } else {
        const response = await mealdb.filterByCategory(category)
        const mealIds = response.data.meals?.slice(0, 8) || []
        const detailPromises = mealIds.map(meal => mealdb.getById(meal.idMeal))
        const details = await Promise.all(detailPromises)
        meals = details.map(d => d.data.meals[0]).filter(Boolean)
      }

      setRecipes(meals)
    } catch (err) {
      setError('Failed to load recipes. Please check your connection and try again.')
      console.error('Recipe fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Search TheMealDB
  const searchRecipes = useCallback(async (query) => {
    if (!query.trim()) {
      fetchRecipes()
      return
    }
    
    setLoading(true)
    setError(null)
    setUsingEdamam(false)
    
    try {
      const response = await mealdb.search(query)
      setRecipes(response.data.meals || [])
    } catch (err) {
      setError('Search failed. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchRecipes])

  // Search Edamam with filters
  const searchWithFilters = useCallback(async (query = '', filters = {}) => {
    setLoading(true)
    setError(null)
    setUsingEdamam(true)
    setActiveFilters(filters)
    
    try {
      const data = await searchEdamamRecipes(query, filters)
      
      // Handle empty results
      if (!data.hits || data.hits.length === 0) {
        console.log('No Edamam results found')
        setRecipes([])
        setLoading(false)
        return
      }
      
      const transformed = data.hits
        .map(transformEdamamRecipe)
        .filter(Boolean) // Remove any null transforms
      
      console.log('Transformed recipes:', transformed.length)
      setRecipes(transformed)
    } catch (err) {
      console.error('Edamam search error:', err)
      if (err.response?.status === 429) {
        setError('API rate limit reached. Please try again in a moment.')
      } else if (err.response?.status === 401) {
        setError('API authentication failed. Please check your credentials.')
      } else if (err.response?.status === 400) {
        setError('Invalid filter combination. Please try different filters.')
      } else {
        setError('Failed to load healthy recipes. Please try again.')
      }
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Clear filters and return to default
  const clearFilters = useCallback(() => {
    setActiveFilters({})
    setUsingEdamam(false)
    fetchRecipes()
  }, [fetchRecipes])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  return { 
    recipes, 
    loading, 
    error, 
    fetchRecipes, 
    searchRecipes,
    searchWithFilters,
    clearFilters,
    activeFilters,
    usingEdamam
  }
}