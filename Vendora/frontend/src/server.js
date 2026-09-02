// Vendora API configuration
// CRA inlines REACT_APP_* vars at build time (VITE_* is supported for future Vite migration).
const API_URL =
  process.env.REACT_APP_API_URL ||
  process.env.VITE_API_URL ||
  "http://localhost:8000/api/v2";

export const server = API_URL;

export const backend_url = API_URL.replace("/api/v2", "/");
