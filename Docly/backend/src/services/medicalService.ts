import mongoose from 'mongoose';
import { Appointment, DoctorProfile, MedicalRecord, Prescription, User } from '../models';
import { AppError } from '../utils/AppError';

/** Resolve a doctor's profile ObjectId for an authenticated doctor user. */
export async function doctorProfileIdForUser(userId: string): Promise<string> {
  const profile = await DoctorProfile.findOne({ user: userId }).select('_id').lean();
  if (!profile) {
    throw new AppError(404, 'Doctor profile not found. Complete your profile first.');
  }
  return String(profile._id);
}

/**
 * Assert that a doctor has "appropriate" access to a patient. Access exists
 * when the two share at least one appointment (i.e. an established medical
 * relationship). This protects the doctor-facing record/prescription endpoints
 * so a doctor can never arbitrarily read another doctor's patients.
 */
export async function doctorHasPatientRelationship(
  doctorUserId: string,
  patientId: string,
  doctorProfileId?: string,
): Promise<boolean> {
  let profileId = doctorProfileId;
  if (!profileId) {
    try {
      profileId = await doctorProfileIdForUser(doctorUserId);
    } catch {
      // No profile yet => a doctor cannot have consulted with anyone.
      return false;
    }
  }
  const rel = await Appointment.exists({
    doctorProfile: new mongoose.Types.ObjectId(profileId),
    patient: new mongoose.Types.ObjectId(patientId),
  });
  return Boolean(rel);
}

/** Guard used by doctor endpoints — throws 403 when no relationship exists. */
export async function assertDoctorPatientRelationship(
  doctorUserId: string,
  patientId: string,
  doctorProfileId?: string,
): Promise<void> {
  const ok = await doctorHasPatientRelationship(doctorUserId, patientId, doctorProfileId);
  if (!ok) {
    throw new AppError(
      403,
      'You do not have access to this patient. Access is limited to patients you have consulted with.',
    );
  }
}

/** Load the patient's user, throwing 404 if absent or not a patient role. */
export async function loadPatientOr404(patientId: string) {
  const patient = await User.findOne({ _id: patientId, role: 'patient' }).select('name email profileImage');
  if (!patient) {
    throw new AppError(404, 'Patient not found.');
  }
  return patient;
}

/** Parse a medicines array from a request body into validated medicine entries. */
export function parseMedicines(raw: unknown): Array<{ name: string; dosage: string; instructions: string; days?: number }> {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) {
    throw new AppError(400, 'medicines must be an array.');
  }
  const medicines = raw
    .filter((m): m is Record<string, unknown> => Boolean(m) && typeof m === 'object')
    .map((m) => {
      const name = typeof m.name === 'string' ? m.name.trim() : '';
      if (!name) {
        throw new AppError(400, 'Each medicine requires a name.');
      }
      const days = typeof m.days === 'number' ? m.days : undefined;
      if (days !== undefined && (!Number.isFinite(days) || days < 1 || days > 365)) {
        throw new AppError(400, 'Medicine duration (days) must be between 1 and 365.');
      }
      return {
        name,
        dosage: typeof m.dosage === 'string' ? m.dosage.trim() : '',
        instructions: typeof m.instructions === 'string' ? m.instructions.trim() : '',
        days,
      };
    });
  return medicines;
}

/** Re-export the models to keep imports concise in controllers. */
export { MedicalRecord, Prescription };