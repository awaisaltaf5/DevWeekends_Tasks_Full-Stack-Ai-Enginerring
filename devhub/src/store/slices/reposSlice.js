import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { searchRepositories } from '../../services/githubAPI.js'

// Initial search
export const fetchRepos = createAsyncThunk(
  'repos/fetchRepos',
  async ({ query, filters }, thunkAPI) => {
    try {
      const response = await searchRepositories(query, filters, 1)
      return response
    } catch (error) {
      console.error('Thunk error:', error.response?.data || error.message)
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch repositories'
      )
    }
  }
)

// Load more (pagination)
export const loadMoreRepos = createAsyncThunk(
  'repos/loadMoreRepos',
  async ({ query, filters, page }, thunkAPI) => {
    try {
      const response = await searchRepositories(query, filters, page)
      return response
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to load more'
      )
    }
  }
)

const initialState = {
  items: [],
  status: 'idle',        // 'idle' | 'loading' | 'succeeded' | 'failed'
  loadMoreStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  totalCount: 0,
  currentQuery: '',
  currentFilters: {},
  currentPage: 1,
  hasMore: true,
}

const reposSlice = createSlice({
  name: 'repos',
  initialState,
  reducers: {
    clearRepos: (state) => {
      state.items = []
      state.status = 'idle'
      state.loadMoreStatus = 'idle'
      state.error = null
      state.totalCount = 0
      state.currentQuery = ''
      state.currentFilters = {}
      state.currentPage = 1
      state.hasMore = true
    },
  },
  extraReducers: (builder) => {
    builder
      // Initial fetch
      .addCase(fetchRepos.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.currentQuery = action.meta.arg.query
        state.currentFilters = action.meta.arg.filters || {}
        state.currentPage = 1
        state.hasMore = true
        state.items = []
      })
      .addCase(fetchRepos.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.items
        state.totalCount = action.payload.total_count
        state.hasMore = action.payload.items.length === 30 && state.items.length < state.totalCount
      })
      .addCase(fetchRepos.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Something went wrong'
      })
      
      // Load more
      .addCase(loadMoreRepos.pending, (state) => {
        state.loadMoreStatus = 'loading'
      })
      .addCase(loadMoreRepos.fulfilled, (state, action) => {
        state.loadMoreStatus = 'succeeded'
        // Append new items to existing items
        state.items = [...state.items, ...action.payload.items]
        state.currentPage = state.currentPage + 1
        state.hasMore = action.payload.items.length === 30 && state.items.length < state.totalCount
      })
      .addCase(loadMoreRepos.rejected, (state, action) => {
        state.loadMoreStatus = 'failed'
        state.error = action.payload || 'Failed to load more'
      })
  },
})

export const { clearRepos } = reposSlice.actions
export default reposSlice.reducer