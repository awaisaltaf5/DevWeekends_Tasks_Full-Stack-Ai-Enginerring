import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  query: '',
  recentSearches: [],
  filters: {
    language: '',
    sort: 'stars',
    order: 'desc',
  },
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {},
})

export default searchSlice.reducer