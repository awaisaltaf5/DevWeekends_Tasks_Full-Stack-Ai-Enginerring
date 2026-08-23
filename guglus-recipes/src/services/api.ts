import axios from 'axios'

// TheMealDB API (Free, no key)
const MEALDB_BASE = 'https://www.themealdb.com/api/json/v1/1'

const api = axios.create({
  baseURL: MEALDB_BASE,
  timeout: 10000,
})

// Spoonacular API (Free tier - optional enrichment)
const SPOONACULAR_BASE = 'https://api.spoonacular.com'
const SPOONACULAR_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY || ''

export const spoonacularApi = axios.create({
  baseURL: SPOONACULAR_BASE,
  timeout: 10000,
  params: SPOONACULAR_KEY ? { apiKey: SPOONACULAR_KEY } : undefined
})

// TheMealDB endpoints
export const mealdb = {
  // Search recipes by name
  search: (query) => api.get(`/search.php?s=${encodeURIComponent(query)}`),
  
  // Get recipe by ID
  getById: (id) => api.get(`/lookup.php?i=${id}`),
  
  // Get random recipe
  random: () => api.get('/random.php'),
  
  // Filter by category
  filterByCategory: (category) => api.get(`/filter.php?c=${encodeURIComponent(category)}`),
  
  // Filter by area/cuisine
  filterByArea: (area) => api.get(`/filter.php?a=${encodeURIComponent(area)}`),
  
  // List all categories
  listCategories: () => api.get('/list.php?c=list'),
  
  // List all areas
  listAreas: () => api.get('/list.php?a=list'),
}

// Ingredient image helper
export const getIngredientImage = (name) => 
  `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name)}-Small.png`

// Recipe image helper (full size)
export const getRecipeImage = (name) =>
  `https://www.themealdb.com/images/media/meals/${name}/preview.jpg`

export default api