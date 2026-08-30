/** Roles available on the Docly platform (mirrors the backend roles). */
export type UserRole = 'patient' | 'doctor' | 'admin';

/** Shape of the authenticated user returned by the API. */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage: string;
  isActive: boolean;
}

/** A medical specialty (from GET /api/specialties). */
export interface Specialty {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive?: boolean;
  doctorCount?: number;
}

/** One qualification listed on a doctor profile. */
export interface Qualification {
  degree: string;
  institution: string;
  year?: number;
}

/** Weekly availability slot (day 0 = Sunday). */
export interface AvailabilitySlot {
  day: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isAvailable: boolean;
  breaks: { startTime: string; endTime: string }[];
}

/** A doctor profile as returned by the API. */
export interface Doctor {
  id: string;
  slug: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage: string;
  };
  specialty: {
    id: string;
    name: string;
    slug: string;
    icon: string;
  };
  qualifications: Qualification[];
  yearsOfExperience: number;
  consultationFee: number;
  bio: string;
  clinicName: string;
  clinicAddress: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    area?: string;
    city: string;
    country: string;
  };
  languages: string[];
  profileImage: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  /** Optional feedback/reason from an admin verification decision. */
  verificationMessage?: string;
  averageRating: number;
  totalRatings: number;
  visitTypes: ('in-person' | 'video')[];
  availability: AvailabilitySlot[];
  blockedDates?: string[];
  isActive: boolean;
}

/** Pagination metadata returned alongside a doctors list. */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Full doctors listing payload. */
export interface DoctorsPayload {
  doctors: Doctor[];
  pagination: Pagination;
}

/** A place returned by the geocoding proxy (Nominatim). */
export interface GeocodePlace {
  displayName: string;
  lat: number;
  lon: number;
  city?: string;
  state?: string;
  country?: string;
  boundingbox?: number[];
}

/** Filters used to query doctors. */
export interface DoctorFilters {
  search: string;
  specialty: string;
  city: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  minFee?: number;
  maxFee?: number;
  minExperience?: number;
  maxExperience?: number;
  minRating?: number;
  sort: DoctorSort;
}

export type DoctorSort =
  | 'relevance'
  | 'rating'
  | 'fee-asc'
  | 'fee-desc'
  | 'experience'
  | 'name';

/** Weekly availability slot as editable in the doctor dashboard. */
export interface AvailabilityBreakForm {
  startTime: string;
  endTime: string;
}

export interface AvailabilitySlotForm {
  day: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isAvailable: boolean;
  breaks: AvailabilityBreakForm[];
}

/** Doctor profile fields editable from the dashboard. */
export interface DoctorProfileUpdate {
  name?: string;
  bio?: string;
  clinicName?: string;
  clinicAddress?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  languages?: string[];
  visitTypes?: ('in-person' | 'video')[];
  qualifications?: Qualification[];
  location?: { city: string; country: string; coordinates: [number, number] };
  specialty?: string;
}

/** Summary statistics shown on the dashboard overview. */
export interface DashboardStats {
  upcomingAppointments: number;
  todayAppointments: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  uniquePatients: number;
  earnings: number;
}

/** Appointment as listed in the doctor dashboard / patient "My Appointments". */
export interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'in-person' | 'video';
  status: 'pending' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes: string;
  fee: number;
  meetingUrl: string;
  meetingId: string;
  patient?: {
    id: string;
    name: string;
    email: string;
    profileImage: string;
  };
  doctorProfile?: {
    id: string;
    clinicName: string;
    clinicAddress?: string;
    consultationFee: number;
    user?: {
      id: string;
      name: string;
      email: string;
      profileImage: string;
    };
  };
  doctor?: {
    id: string;
    name: string;
    email: string;
    profileImage: string;
  };
  specialty?: {
    id: string;
    name: string;
    slug: string;
  };
  patientContact?: {
    phone?: string;
    email?: string;
  };
}

/** Payload for updating an appointment's status by the doctor. */
export type AppointmentStatusUpdate = 'pending' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled' | 'no-show';

/** Patient listed in the dashboard patients tab. */
export interface Patient {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  completedVisits: number;
}

/** A generated bookable slot. */
export interface BookableSlot {
  startTime: string;
  endTime: string;
}

/** Consistent API error body. */
export interface ApiError {
  success: false;
  message: string;
  stack?: string;
}

/** Generic envelope used by success responses (data fields are spread). */
export interface ApiSuccess {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

/** Kind of document a patient uploaded to their medical history. */
export type MedicalRecordType = 'medical-report' | 'lab-report' | 'prescription' | 'document';

/** A medical record uploaded by a patient or their doctor. */
export interface MedicalRecord {
  id: string;
  patient: string;
  doctor?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  } | null;
  title: string;
  description: string;
  recordType: MedicalRecordType;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: 'patient' | 'doctor';
  createdAt?: string;
}

/** A single medicine entry on a prescription. */
export interface Medicine {
  name: string;
  dosage: string;
  instructions: string;
  days?: number;
}

/** A prescription written by a doctor for a patient. */
export interface Prescription {
  id: string;
  patient?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  doctor?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  doctorProfile?: {
    id: string;
    clinicName?: string;
    doctorName?: string;
    specialty?: { id: string; name: string };
  };
  appointment?: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
  };
  diagnosis: string;
  notes: string;
  medicines: Medicine[];
  createdAt?: string;
}

/** Payload for a doctor creating a prescription. */
export interface PrescriptionInput {
  patientId: string;
  appointmentId?: string;
  diagnosis: string;
  notes: string;
  medicines: Medicine[];
}
/** An in-app notification for the authenticated user. */
export interface AppNotification {
  id: string;
  type:
    | 'appointment.booking'
    | 'appointment.cancellation'
    | 'appointment.status_update'
    | 'doctor.approved'
    | 'medical_record.new';
  title: string;
  message: string;
  link: string;
  relatedId: string;
  read: boolean;
  createdAt?: string;
}

/** Metadata for listing notifications. */
export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Meeting config returned by the video consultation endpoint. */
export interface VideoMeeting {
  appointmentId: string;
  room: string;
  url: string;
  appId: string;
  token: string | null;
  displayName: string;
  role: 'host' | 'guest';
}
