import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { store } from './app/store'
import { fetchMe } from './features/auth/authSlice'
import App from './App.jsx'
import './index.css'

/**
 * On first load, attempt to restore the persisted session by calling
 * GET /api/auth/me with the token stored in localStorage. If the token is
 * missing or invalid the auth state is cleared and protected routes will
 * redirect to /login.
 */
function AppInitializer({ children }) {
  const dispatch = useDispatch()
  const token = useSelector((state) => state.auth.token)

  useEffect(() => {
    if (token) dispatch(fetchMe())
  }, [dispatch, token])

  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppInitializer>
          <App />
        </AppInitializer>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)

