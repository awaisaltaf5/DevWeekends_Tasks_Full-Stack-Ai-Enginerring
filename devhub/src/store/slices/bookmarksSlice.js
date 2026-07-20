import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  categories: ['All', 'Learning', 'Work', 'Inspiration', 'Tools'],
  activeCategory: 'All',
}

const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {},
})

export default bookmarksSlice.reducer