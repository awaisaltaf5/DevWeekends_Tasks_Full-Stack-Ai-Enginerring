import { useState, useEffect, useCallback } from 'react'
import { mealdb, getIngredientImage } from '../services/api'

export function useRecipeDetail(recipeId) {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRecipe = useCallback(async () => {
    if (!recipeId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await mealdb.getById(recipeId)
      const meal = response.data.meals?.[0]
      
      if (!meal) {
        setError('Recipe not found. It may have been removed.')
        return
      }

      // Parse ingredients and measures into structured array
      const ingredients = []
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`]
        const measure = meal[`strMeasure${i}`]
        
        if (ingredient && ingredient.trim()) {
          ingredients.push({
            id: i,
            name: ingredient.trim(),
            amount: measure?.trim() || 'to taste',
            image: getIngredientImage(ingredient.trim())
          })
        }
      }

      // Parse instructions into steps
      const instructions = meal.strInstructions
        ?.split(/\r\n|\n/)
        .filter(step => step.trim().length > 10)
        .map((step, index) => ({
          id: index + 1,
          text: step.trim()
        })) || []

      setRecipe({
        ...meal,
        parsedIngredients: ingredients,
        parsedInstructions: instructions
      })
    } catch (err) {
      setError('Failed to load recipe details. Please check your connection.')
      console.error('Recipe detail error:', err)
    } finally {
      setLoading(false)
    }
  }, [recipeId])

  useEffect(() => {
    fetchRecipe()
  }, [fetchRecipe])

  return { recipe, loading, error, refetch: fetchRecipe }
}