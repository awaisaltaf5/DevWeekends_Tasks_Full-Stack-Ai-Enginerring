// Type definitions for Admin Portal

export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type UserRole = 'admin' | 'doctor' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Qualification {
  degree: string;
  institution: string;
  year?: number;
}

export interface DoctorProfile {
  id: string;
  user: User;
  specialty: {
    id: string;
    name: string;
    description?: string;
    slug?: string;
    icon?: string;
  };
  qualifications: Qualification[];
  yearsOfExperience: number;
  consultationFee: number;
  bio: string;
  clinicName: string;
  clinicAddress: string;
  location: {
    coordinates: [number, number];
    area?: string;
    city?: string;
    country?: string;
  };
  languages: string[];
  profileImage: string;
  verificationStatus: VerificationStatus;
  verificationMessage?: string;
  verificationUpdatedAt?: string;
  verificationDocuments?: VerificationDocument[];
  averageRating: number;
  totalRatings: number;
  visitTypes: string[];
  isActive: boolean;
  removedAt?: string | null;
  removedReason?: string;
  removedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationDocument {
  label: string;
  url: string;
  publicId?: string;
  uploadedAt?: string;
}

export interface AdminDashboardStats {
  totalDoctors: number;
  pendingDoctors: number;
  approvedDoctors: number;
  rejectedDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
}

export interface AdminAuth {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin';
  };
}

export interface Specialty {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
}

export interface VerificationAction {
  action: 'approve' | 'reject' | 'request_changes';
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
