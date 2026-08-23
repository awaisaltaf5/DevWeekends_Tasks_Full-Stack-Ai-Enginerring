import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../app/api/hotelApi'

/**
 * Reviews slice.
 *
 * `reviews` holds the populated review list for the currently-viewed hotel.
 * `reviewing` tracks the in-flight review create/update so the form can show a
 * live loading state. Edits and deletions optimistically update the cached
 * list.
 */

export const fetchReviews = createAsyncThunk(
  'reviews/list',
  async (hotelId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/hotels/${hotelId}/reviews`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const createReview = createAsyncThunk(
  'reviews/create',
  async ({ hotelId, rating, comment }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/hotels/${hotelId}/reviews`, { rating, comment })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const updateReview = createAsyncThunk(
  'reviews/update',
  async ({ id, rating, comment }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/reviews/${id}`, { rating, comment })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/reviews/${id}`)
      return { id }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

const initialState = {
  reviews: [],
  loading: false,
  reviewing: false,
  error: null,
}

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviewsError(state) {
      state.error = null
    },
    resetReviews(state) {
      state.reviews = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false
        state.reviews = action.payload.reviews || []
        state.error = null
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to load reviews'
      })

      .addCase(createReview.pending, (state) => {
        state.reviewing = true
        state.error = null
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.reviewing = false
        const review = action.payload.review
        if (review) {
          state.reviews.unshift(review)
        }
        state.error = null
      })
      .addCase(createReview.rejected, (state, action) => {
        state.reviewing = false
        state.error =
          action.payload?.message || action.payload || 'Failed to create review'
      })

      .addCase(updateReview.fulfilled, (state, action) => {
        const updated = action.payload.review
        state.reviews = state.reviews.map((r) =>
          r.id === updated.id ? updated : r
        )
        state.error = null
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update review'
      })

      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter((r) => r.id !== action.payload.id)
        state.error = null
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.error = action.payload || 'Failed to delete review'
      })
  },
})

export const { clearReviewsError, resetReviews } = reviewsSlice.actions
export default reviewsSlice.reducer