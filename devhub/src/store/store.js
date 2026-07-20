import { configureStore } from '@reduxjs/toolkit'
import reposReducer from './slices/reposSlice.js'
import bookmarksReducer from './slices/bookmarksSlice.js'
import searchReducer from './slices/searchSlice.js'

export const store = configureStore({
  reducer: {
    repos: reposReducer,
    bookmarks: bookmarksReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
})

export default store