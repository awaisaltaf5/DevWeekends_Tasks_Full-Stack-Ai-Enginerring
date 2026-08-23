import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../app/api/hotelApi'

/**
 * Saved hotels slice.
 *
 * `savedIds` is a Set-backed array of hotel ids used by the save buttons on
 * hotel cards / detail pages for instant optimistic UI. `savedHotels` holds
 * the full populated rows for the /saved page.
 */

// ----- API calls -----------------------------------------------------------
export const fetchSaved = createAsyncThunk(
  'saved/list',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/saved')
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const saveHotel = createAsyncThunk(
  'saved/save',
  async (hotelId, { rejectWithValue }) => {
    try {
      const res = await api.post('/saved', { hotel: hotelId })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const removeSaved = createAsyncThunk(
  'saved/remove',
  async (hotelId, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/saved/${hotelId}`)
      return { ...res.data, hotelId }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

// ----- Slice ---------------------------------------------------------------
const initialState = {
  savedIds: [],
  savedHotels: [],
  loading: false,
  savingId: null,
  error: null,
}

const savedSlice = createSlice({
  name: 'saved',
  initialState,
  reducers: {
    clearSavedError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSaved.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSaved.fulfilled, (state, action) => {
        state.loading = false
        state.savedHotels = action.payload.saved || []
        state.savedIds = (action.payload.saved || [])
          .map((saved) => saved.hotel?.id)
          .filter(Boolean)
        state.error = null
      })
      .addCase(fetchSaved.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to load saved hotels'
      })

      .addCase(saveHotel.pending, (state, action) => {
        state.savingId = action.meta.arg
      })
      .addCase(saveHotel.fulfilled, (state, action) => {
        state.savingId = null
        const saved = action.payload.saved
        const hotelId = saved?.hotel?.id || saved?.hotel
        if (hotelId && !state.savedIds.some((savedId) => String(savedId) === String(hotelId))) {
          state.savedIds.push(hotelId)
        }
        // Add the populated row for the /saved page if not already present.
        if (
          saved?.hotel?.id &&
          !state.savedHotels.some((s) => s.id === saved.id)
        ) {
          state.savedHotels.unshift(saved)
        }
        state.error = null
      })
      .addCase(saveHotel.rejected, (state, action) => {
        state.savingId = null
        state.error = action.payload || 'Failed to save hotel'
      })

      .addCase(removeSaved.pending, (state, action) => {
        state.savingId = action.meta.arg
      })
      .addCase(removeSaved.fulfilled, (state, action) => {
        state.savingId = null
        const hotelId = action.meta.arg
        state.savedIds = state.savedIds.filter((id) => String(id) !== String(hotelId))
        state.savedHotels = state.savedHotels.filter(
          (s) => String(s.hotel?.id) !== String(hotelId)
        )
        state.error = null
      })
      .addCase(removeSaved.rejected, (state, action) => {
        state.savingId = null
        state.error = action.payload || 'Failed to remove saved hotel'
      })
  },
})

export const { clearSavedError } = savedSlice.actions
export default savedSlice.reducer
