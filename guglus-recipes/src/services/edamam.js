import axios from 'axios'

// Edamam Recipe Search API v2 Base Endpoint
const EDAMAM_BASE = 'https://api.edamam.com/api/recipes/v2'

export const DIET_FILTERS = [
  { id: 'balanced', label: 'Balanced' },
  { id: 'high-protein', label: 'High Protein' },
  { id: 'low-carb', label: 'Low Carb' },
  { id: 'low-fat', label: 'Low Fat' },
]

export const HEALTH_FILTERS = [
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'keto-friendly', label: 'Keto' },
  { id: 'gluten-free', label: 'Gluten Free' },
  { id: 'dairy-free', label: 'Dairy Free' },
  { id: 'peanut-free', label: 'Peanut Free' },
  { id: 'sugar-conscious', label: 'Sugar Conscious' },
  { id: 'egg-free', label: 'Egg Free' },
]

export const CALORIE_RANGES = [
  { id: '0-200', label: '0 - 200 kcal', min: 0, max: 200 },
  { id: '200-400', label: '200 - 400 kcal', min: 200, max: 400 },
  { id: '400-600', label: '400 - 600 kcal', min: 400, max: 600 },
  { id: '600-800', label: '600 - 800 kcal', min: 600, max: 800 },
  { id: '800+', label: '800+ kcal', min: 800, max: 9999 },
]

export const searchEdamamRecipes = async (query = '', filters = {}) => {
  const { diet, health, calories } = filters
  
  // Pull credentials directly from the updated .env file via Vite
  const appId = import.meta.env.VITE_EDAMAM_APP_ID
  const appKey = import.meta.env.VITE_EDAMAM_APP_KEY

  if (!appId || !appKey) {
    throw new Error('Missing Edamam API credentials in .env file')
  }

  const params = {
    type: 'public',
    q: query || 'recipe',
    app_id: appId,
    app_key: appKey,
  }

  if (diet && diet.trim() !== '') {
    params.diet = diet.trim()
  }
  
  if (health && health.trim() !== '') {
    params.health = health.trim()
  }
  
  if (calories && calories.trim() !== '') {
    const range = CALORIE_RANGES.find(r => r.id === calories)
    if (range) {
      params.calories = `${range.min}-${range.max}`
    }
  }

  try {
    const response = await axios.get(EDAMAM_BASE, { 
      params,
      timeout: 15000 
    })
    return response.data
  } catch (error) {
    console.error('Edamam API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    })
    throw error
  }
}

export const transformEdamamRecipe = (hit) => {
  if (!hit || !hit.recipe) return null
  const recipe = hit.recipe
  
  return {
    idMeal: recipe.uri ? recipe.uri.split('#')[1] || recipe.uri : `edamam-${Date.now()}-${Math.random()}`,
    strMeal: recipe.label || 'Untitled Recipe',
    strMealThumb: recipe.image || 'https://via.placeholder.com/400x300?text=No+Image',
    strCategory: recipe.cuisineType?.[0] || 'General',
    strArea: recipe.cuisineType?.[0] || 'International',
    strInstructions: recipe.ingredientLines?.join('\n\n') || 'No instructions available.',
    strYoutube: '',
    strSource: recipe.url || '',
    parsedIngredients: recipe.ingredients?.map((ing, i) => ({
      id: i + 1,
      name: ing.food || 'Unknown',
      amount: `${ing.quantity || ''} ${ing.measure || 'piece'}`.trim(),
      image: ing.image || '',
    })) || [],
    parsedInstructions: recipe.ingredientLines?.map((step, i) => ({
      id: i + 1,
      text: step,
    })) || [],
    calories: Math.round(recipe.calories || 0),
    totalTime: recipe.totalTime || 0,
    dietLabels: recipe.dietLabels || [],
    healthLabels: recipe.healthLabels || [],
    cuisineType: recipe.cuisineType || [],
    mealType: recipe.mealType || [],
    yield: recipe.yield || 1,
  }
}

export default { searchEdamamRecipes, transformEdamamRecipe }