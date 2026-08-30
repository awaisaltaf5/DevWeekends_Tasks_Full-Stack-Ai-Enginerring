import { api } from './api';
import type {
  MedicalRecord,
  MedicalRecordType,
  Prescription,
  PrescriptionInput,
} from '../types';

interface ApiSuccess {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

/** GET /api/medical-records/me — the patient's own medical history. */
export async function fetchMyMedicalRecords(): Promise<MedicalRecord[]> {
  const { data } = await api.get<ApiSuccess & { records?: MedicalRecord[] }>('/medical-records/me');
  return data.records ?? [];
}

/** POST /api/medical-records — a patient uploads one of their own documents. */
export async function uploadMyMedicalRecord(input: {
  file: File;
  title: string;
  description?: string;
  recordType: MedicalRecordType;
}): Promise<MedicalRecord> {
  const form = new FormData();
  form.append('file', input.file);
  form.append('title', input.title);
  if (input.description) form.append('description', input.description);
  form.append('recordType', input.recordType);
  const { data } = await api.post<ApiSuccess & { record?: MedicalRecord }>(
    '/medical-records',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  if (!data.record) throw new Error('No record returned');
  return data.record;
}

/** DELETE /api/medical-records/:id — patient deletes one of their own records. */
export async function deleteMyMedicalRecord(id: string): Promise<void> {
  await api.delete(`/medical-records/${id}`);
}

/** GET /api/prescriptions/me — the patient's own prescriptions. */
export async function fetchMyPrescriptions(): Promise<Prescription[]> {
  const { data } = await api.get<ApiSuccess & { prescriptions?: Prescription[] }>(
    '/prescriptions/me',
  );
  return data.prescriptions ?? [];
}

/** GET /api/prescriptions/:id — view a single prescription (owner/author/admin). */
export async function fetchPrescription(id: string): Promise<Prescription> {
  const { data } = await api.get<ApiSuccess & { prescription: Prescription }>(
    `/prescriptions/${id}`,
  );
  return data.prescription;
}

/* ---------------- Doctor-facing medical endpoints ---------------- */

/** GET /api/doctor/patients/:patientId/records — doctor views a patient's records. */
export async function fetchPatientRecords(patientId: string): Promise<MedicalRecord[]> {
  const { data } = await api.get<ApiSuccess & { records?: MedicalRecord[] }>(
    `/doctor/patients/${patientId}/records`,
  );
  return data.records ?? [];
}

/** POST /api/doctor/patients/:patientId/records — doctor uploads a record for a patient. */
export async function doctorUploadRecord(input: {
  patientId: string;
  file: File;
  title: string;
  description?: string;
  recordType: MedicalRecordType;
}): Promise<MedicalRecord> {
  const form = new FormData();
  form.append('file', input.file);
  form.append('title', input.title);
  if (input.description) form.append('description', input.description);
  form.append('recordType', input.recordType);
  const { data } = await api.post<ApiSuccess & { document?: MedicalRecord }>(
    `/doctor/patients/${input.patientId}/records`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  if (!data.document) throw new Error('Upload returned no record');
  return data.document;
}

/** POST /api/doctor/prescriptions — doctor writes consultation info + prescription. */
export async function createPrescription(input: PrescriptionInput): Promise<Prescription> {
  const { data } = await api.post<ApiSuccess & { prescription: Prescription }>(
    '/doctor/prescriptions',
    input,
  );
  return data.prescription;
}

/** GET /api/doctor/prescriptions?patientId= — the doctor's own prescriptions. */
export async function fetchDoctorPrescriptions(patientId?: string): Promise<Prescription[]> {
  const qs = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  const { data } = await api.get<ApiSuccess & { prescriptions?: Prescription[] }>(
    `/doctor/prescriptions${qs}`,
  );
  return data.prescriptions ?? [];
}

/** MIME/extension validation for medical uploads (mirrors backend). */
export const ALLOWED_UPLOAD_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateMedicalFile(file: File): string | null {
  const ext = (file.name.split('.').pop() ?? '').toLowerCase();
  if (!ALLOWED_UPLOAD_EXTENSIONS.includes(ext)) {
    return 'Invalid file type. Allowed: JPG, JPEG, PNG, WEBP, PDF.';
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'File is too large. Maximum size is 10 MB.';
  }
  return null;
}