import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import hotelReducer from '../features/hotels/hotelSlice'
import bookingReducer from '../features/bookings/bookingSlice'
import savedReducer from '../features/saved/savedSlice'
import reviewsReducer from '../features/reviews/reviewsSlice'

export const store = configureStore({
    reducer: {
    auth: authReducer,
    hotels: hotelReducer,
    bookings: bookingReducer,
    saved: savedReducer,
    reviews: reviewsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
})

export default store
