import { api } from './api';
import type { User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
  recoveryCodes?: string[];
}

/** Persist the JWT token + user so the session survives a page refresh. */
function persist(token: string, user: User): void {
  localStorage.setItem('docly_token', token);
  localStorage.setItem('docly_user', JSON.stringify(user));
}

function clearPersisted(): void {
  localStorage.removeItem('docly_token');
  localStorage.removeItem('docly_user');
}

/** Read the persisted session (token + user), if present. */
export function getStoredSession(): { token: string; user: User } | null {
  const token = localStorage.getItem('docly_token');
  const raw = localStorage.getItem('docly_user');
  if (!token || !raw) return null;
  try {
    return { token, user: JSON.parse(raw) as User };
  } catch {
    return null;
  }
}

export function clearStoredSession(): void {
  clearPersisted();
}

/** Register a new patient or doctor account. */
export async function register(
  name: string,
  email: string,
  password: string,
  role: 'patient' | 'doctor' = 'patient',
  recoveryCodes: string[],
): Promise<AuthResponse> {
  const { data } = await api.post<{ success: boolean; token: string; user: User; recoveryCodes?: string[] }>(
    '/auth/register',
    { name, email, password, role, recoveryCodes },
  );
  persist(data.token, data.user);
  api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  return { token: data.token, user: data.user };
}

export async function resetPassword(email: string, recoveryCode: string, password: string): Promise<void> {
  await api.post('/auth/password-reset', { email, recoveryCode, password });
}

/** Log in an existing user and start an authenticated session. */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<{ success: boolean; token: string; user: User }>(
    '/auth/login',
    { email, password },
  );
  persist(data.token, data.user);
  api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  return { token: data.token, user: data.user };
}

/** Verify a Google Identity Services credential and start an authenticated session. */
export async function googleAuthenticate(
  credential: string,
  role: 'patient' | 'doctor',
): Promise<AuthResponse> {
  const { data } = await api.post<{ success: boolean; token: string; user: User }>(
    '/auth/google',
    { credential, role },
  );
  persist(data.token, data.user);
  api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  return { token: data.token, user: data.user };
}

/** End the current session and clear persisted state. */
export function logout(): void {
  clearPersisted();
  delete api.defaults.headers.common['Authorization'];
}
