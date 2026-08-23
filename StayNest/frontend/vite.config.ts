import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite proxies /api requests to the Express backend so the dev server can
// be used without configuring CORS for local development.
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
