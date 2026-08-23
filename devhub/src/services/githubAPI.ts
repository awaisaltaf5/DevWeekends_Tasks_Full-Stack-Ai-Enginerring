import axios from 'axios'

const GITHUB_API = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 10000,
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
})

// Search repositories with pagination
export async function searchRepositories(query, filters = {}, page = 1) {
  const { language = '', sort = 'stars', order = 'desc' } = filters
  
  let q = ''
  
  if (query && query.trim() && !query.startsWith('stars:')) {
    q = query.trim()
  } else {
    q = 'stars:>1000'
  }
  
  if (language && language !== 'All') {
    q = `${q} language:${language.toLowerCase()}`
  }
  
  console.log('🔍 GitHub API Query:', q, '| Page:', page)
  
  try {
    const response = await GITHUB_API.get('/search/repositories', {
      params: {
        q,
        sort,
        order,
        per_page: 30,
        page,
      },
    })
    
    return response.data
  } catch (error) {
    console.error('❌ GitHub API Error:', error.response?.data || error.message)
    throw error
  }
}

// Get single repository details
export async function getRepository(owner, name) {
  const response = await GITHUB_API.get(`/repos/${owner}/${name}`)
  return response.data
}

// Get repository README
export async function getReadme(owner, name) {
  try {
    const response = await GITHUB_API.get(`/repos/${owner}/${name}/readme`, {
      headers: { Accept: 'application/vnd.github.html' },
    })
    return response.data
  } catch {
    return null
  }
}