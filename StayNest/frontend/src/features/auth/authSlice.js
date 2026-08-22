import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../app/api/hotelApi'

/**
 * Auth slice — manages the current user, JWT token, loading and error state.
 *
 * The token (and the decoded user) are persisted to localStorage so a hard
 * refresh keeps the session. The session is also re-validated on load by
 * dispatching `fetchMe` (see main.jsx's AppInitializer).
 */
const TOKEN_KEY = 'token'
const USER_KEY = 'user'

const getPersistedToken = () => localStorage.getItem(TOKEN_KEY)
const getPersistedUser = () => {
  const raw = localStorage.getItem(USER_KEY)
  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const startLoading = (state) => {
  state.loading = true
  state.error = null
}

const writeSession = (state, payload) => {
  state.currentUser = payload.user
  state.token = payload.token
  state.loading = false
  state.error = null
  localStorage.setItem(TOKEN_KEY, payload.token)
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
}

const clearSession = (state) => {
  state.currentUser = null
  state.token = null
  state.loading = false
  state.error = null
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// Shared async auth calls (the `api` axios instance proxies /api in dev).
export const register = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', data)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', data)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/logout')
      return res.data
    } catch (err) {
      // Logging out should succeed even if the server is unreachable; the
      // token is discarded client-side regardless.
      if (err.response) {
        return rejectWithValue(err.response?.data?.message || err.message)
      }
      return { success: true, message: 'Logged out' }
    }
  }
)

export const fetchMe = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me')
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.put('/auth/profile', data)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.put('/auth/change-password', data)
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message)
    }
  }
)

const initialState = {
  currentUser: getPersistedUser(),
  token: getPersistedToken(),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, startLoading)
      .addCase(register.fulfilled, (state, action) => {
        writeSession(state, action.payload)
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Registration failed'
      })

      .addCase(login.pending, startLoading)
      .addCase(login.fulfilled, (state, action) => {
        writeSession(state, action.payload)
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Login failed'
      })

      .addCase(logout.fulfilled, (state) => {
        clearSession(state)
      })

      .addCase(fetchMe.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload.user
      })
      .addCase(fetchMe.rejected, (state) => {
        // Token missing/invalid/expired — reset the session.
        clearSession(state)
      })

      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload.user
        // Keep localStorage in sync so a refresh keeps the updated profile.
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user))
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to update profile'
      })

      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to change password'
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer

