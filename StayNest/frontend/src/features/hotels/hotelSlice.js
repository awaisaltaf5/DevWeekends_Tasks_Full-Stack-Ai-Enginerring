import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../app/api/hotelApi'

/**
 * Hotel Discovery — Redux Toolkit slice.
 * `fetchHotels` supports the same query params as the API
 * (page, limit, search, city, minPrice, maxPrice, rating, sort, featured).
 */
export const fetchHotels = createAsyncThunk(
  'hotels/list',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/hotels', { params })
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const fetchHotelById = createAsyncThunk(
  'hotels/detail',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/hotels/${id}`)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

const initialState = {
  hotels: [],
  hotel: null,
  loading: false,
  detailLoading: false,
  error: null,
  total: 0,
  totalPages: 1,
  currentPage: 1,
}

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    clearHotelsError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false
        state.hotels = action.payload.hotels
        state.total = action.payload.total
        state.totalPages = action.payload.totalPages
        state.currentPage = action.payload.currentPage
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to load hotels'
      })
      .addCase(fetchHotelById.pending, (state) => {
        state.detailLoading = true
        state.error = null
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.detailLoading = false
        state.hotel = action.payload.hotel
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.detailLoading = false
        state.error = action.payload || 'Failed to load hotel'
      })
  },
})

export const { clearHotelsError } = hotelSlice.actions
export default hotelSlice.reducer