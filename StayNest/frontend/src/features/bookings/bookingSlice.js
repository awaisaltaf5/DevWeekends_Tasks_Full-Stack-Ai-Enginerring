import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  createBooking as createBookingApi,
  fetchBookings as fetchBookingsApi,
  fetchBooking as fetchBookingApi,
  cancelBooking as cancelBookingApi,
} from '../../app/api/bookingApi'

/**
 * Booking state — Redux Toolkit slice.
 *
 * `createBooking` resolves with { booking, numberOfNights, totalPrice } from
 * the backend so the confirmation page can display the server-authoritative
 * price. `cancelBooking` optimistically updates the cached list + detail.
 */
export const createBooking = createAsyncThunk(
  'bookings/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await createBookingApi(payload)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const fetchBookings = createAsyncThunk(
  'bookings/list',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchBookingsApi()
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const fetchBooking = createAsyncThunk(
  'bookings/detail',
  async (id, { rejectWithValue }) => {
    try {
      return await fetchBookingApi(id)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (id, { rejectWithValue }) => {
    try {
      return await cancelBookingApi(id)
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

const initialState = {
  bookings: [],
  booking: null,
  numberOfNights: 0,
  totalPrice: 0,
  loading: false,
  error: null,
}

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearBookingError(state) {
      state.error = null
    },
    resetBooking(state) {
      state.booking = null
      state.numberOfNights = 0
      state.totalPrice = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false
        state.booking = action.payload.booking
        state.bookings = [
          action.payload.booking,
          ...state.bookings.filter((booking) => booking.id !== action.payload.booking.id),
        ]
        state.numberOfNights = action.payload.numberOfNights
        state.totalPrice = action.payload.totalPrice
        state.error = null
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to create booking'
      })
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload.bookings
        state.error = null
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to load bookings'
      })
      .addCase(fetchBooking.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBooking.fulfilled, (state, action) => {
        state.loading = false
        state.booking = action.payload.booking
        state.error = null
      })
      .addCase(fetchBooking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to load booking'
      })
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        const updated = action.payload.booking
        state.booking = state.booking?.id === updated.id ? updated : state.booking
        state.bookings = state.bookings.map((b) =>
          b.id === updated.id ? updated : b
        )
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to cancel booking'
      })
  },
})

export const { clearBookingError, resetBooking } = bookingSlice.actions
export default bookingSlice.reducer
