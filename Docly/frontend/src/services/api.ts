import axios, { AxiosError } from 'axios';
import type { ApiError } from '../types';

// Prefer the configured backend URL; fall back to the Vite dev proxy (`/api`
// is proxied to http://localhost:5000 by vite.config.ts).
const rawBase = import.meta.env.VITE_API_URL as string | undefined;
export const API_BASE_URL = (rawBase ? rawBase.replace(/\/$/, '') : '/api') || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

/** Extract a human-readable message from an Axios error. */
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<ApiError>).response?.data;
    if (data?.message) {
      return data.message;
    }
    if (error.code === 'ECONNABORTED') {
      return 'The request timed out. Please try again.';
    }
    if (error.response) {
      return `Request failed (${error.response.status}).`;
    }
    return 'Unable to reach the server. Is the backend running?';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}