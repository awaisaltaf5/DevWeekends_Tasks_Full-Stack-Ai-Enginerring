import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { AdminAuth, ApiResponse, DoctorProfile, AdminDashboardStats, Specialty } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AdminAPIService {
  private client: AxiosInstance;

  private unwrap<T>(response: any): T {
    const payload = response?.data ?? response;
    if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
      return payload.data as T;
    }
    return payload as T;
  }

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to every request
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle 401 responses by clearing token and redirecting
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Admin login with credentials
   */
  async adminLogin(username: string, password: string): Promise<AdminAuth> {
    try {
      const response = await this.client.post<ApiResponse<AdminAuth>>(
        '/auth/admin-login',
        { username, password }
      );
      const payload = this.unwrap<AdminAuth>(response);
      if (payload && payload.token && payload.user) {
        return payload;
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const response = await this.client.get<ApiResponse<AdminDashboardStats>>(
        '/admin/statistics'
      );
      const payload = this.unwrap<AdminDashboardStats>(response);
      if (payload) {
        return payload;
      }
      throw new Error(response.data.message || 'Failed to fetch statistics');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }

  /**
   * Get all doctors with optional filtering
   */
  async getDoctors(filters?: {
    status?: string;
    specialty?: string;
    location?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ doctors: DoctorProfile[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.specialty) params.append('specialty', filters.specialty);
      if (filters?.location) params.append('location', filters.location);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await this.client.get<ApiResponse<any>>(
        `/admin/doctors?${params.toString()}`
      );
      const payload = this.unwrap<{ doctors: DoctorProfile[]; total: number }>(response);
      if (payload) {
        return payload;
      }
      throw new Error(response.data.message || 'Failed to fetch doctors');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch doctors');
    }
  }

  /**
   * Get single doctor profile
   */
  async getDoctorById(doctorId: string): Promise<DoctorProfile> {
    try {
      const response = await this.client.get<ApiResponse<DoctorProfile>>(
        `/admin/doctors/${doctorId}`
      );
      const payload = this.unwrap<DoctorProfile>(response);
      if (payload) {
        return payload;
      }
      throw new Error(response.data.message || 'Failed to fetch doctor');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch doctor');
    }
  }

  /**
   * Update doctor verification status
   */
     async updateDoctorVerification(
    doctorId: string,
    action: 'approve' | 'reject' | 'request_changes',
    message?: string
  ): Promise<DoctorProfile> {
    try {
      const response = await this.client.put<ApiResponse<DoctorProfile>>(
        `/admin/doctors/${doctorId}/verify`,
        { action, message }
      );
      const payload = this.unwrap<DoctorProfile>(response);
      if (payload) {
        return payload;
      }
      throw new Error(response.data.message || 'Failed to update verification');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update verification');
    }
  }

  /**
   * Remove a doctor (soft-delete). Requires a non-empty removal reason.
   * Returns the removal result including whether the email was sent.
   */
  async removeDoctor(doctorId: string, reason: string): Promise<{
    success: boolean;
    message: string;
    emailSent: boolean;
    doctor: DoctorProfile;
  }> {
    try {
      const response = await this.client.delete<ApiResponse<any>>(
        `/admin/doctors/${doctorId}/remove`,
        { data: { reason } }
      );
      return this.unwrap<{ success: boolean; message: string; emailSent: boolean; doctor: DoctorProfile }>(response);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to remove doctor';
      const status = error.response?.status || 0;
      const result: any = { success: false, message: msg, emailSent: false, doctor: null };
      if (status) result.status = status;
      throw result;
    }
  }

  /**
   * Resolve a hosted asset URL for display (e.g. a Cloudinary secure_url,
   * Unsplash image or empty string). Absolute https URLs are returned as-is so
   * images load straight from their CDN without proxying or browser cookies.
   * Anything else falls back to '' so the UI can render a graceful placeholder.
   */
  resolveAssetUrl(value?: string | null): string {
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    return '';
  }

  /**
   * Get active specialties (public endpoint) to power the specialty filter,
   * which must send a real specialty id to the backend.
   */
  async getSpecialties(): Promise<Specialty[]> {
    try {
      const response = await this.client.get<any>('/specialties');
      const payload = response?.data;
      const list: Specialty[] = Array.isArray(payload?.specialties)
        ? payload.specialties
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      return list;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load specialties');
    }
  }
}

export const adminAPI = new AdminAPIService();
