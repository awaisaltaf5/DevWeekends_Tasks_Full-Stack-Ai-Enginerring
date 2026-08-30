import { type Request, type Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../utils/AppError';
import { MedicalRecord } from '../models';
import {
  uploadMedicalFile,
  isCloudinaryConfigured,
} from '../services/cloudinaryService';
import { assertDoctorPatientRelationship } from '../services/medicalService';
import type { MedicalRecordType } from '../models';

interface RecordFields {
  title?: string;
  description?: string;
  recordType?: string;
}

function readRecordFields(body: unknown): RecordFields {
  const out: RecordFields = {};
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;
    if (typeof obj.title === 'string') out.title = obj.title;
    if (typeof obj.description === 'string') out.description = obj.description;
    if (typeof obj.recordType === 'string') out.recordType = obj.recordType;
  }
  return out;
}

const RECORD_TYPES = ['medical-report', 'lab-report', 'prescription', 'document'];

/** Shared upload logic used by patient and doctor record uploads. */
async function createRecord(opts: {
  patientId: string;
  doctorId?: string;
  uploadedBy: 'patient' | 'doctor';
  file?: Express.Multer.File;
  title?: string;
  description?: string;
  recordType?: string;
}) {
  const recordType: MedicalRecordType =
    opts.recordType && RECORD_TYPES.includes(opts.recordType)
      ? (opts.recordType as MedicalRecordType)
      : 'document';

  if (!opts.file?.buffer || opts.file.buffer.length === 0) {
    throw new AppError(400, 'No file provided. Attach a report, image or PDF.');
  }
  if (!opts.title || opts.title.trim().length < 2) {
    throw new AppError(400, 'A title (at least 2 characters) is required.');
  }
  if (!isCloudinaryConfigured()) {
    throw new AppError(
      503,
      'Upload service is not configured. Add CLOUDINARY_* variables to the backend environment.',
    );
  }

  const publicIdBase = `rec-${opts.patientId.slice(-8)}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const uploaded = await uploadMedicalFile(
    opts.file.buffer,
    opts.file.originalname ?? 'document.pdf',
    publicIdBase,
  );
  if (!uploaded) {
    throw new AppError(502, 'File upload failed. Please try again.');
  }

  return MedicalRecord.create({
    patient: opts.patientId,
    doctor: opts.doctorId,
    title: opts.title.trim(),
    description: opts.description?.trim() ?? '',
    recordType,
    fileUrl: uploaded.url,
    filePublicId: uploaded.publicId,
    fileName: opts.file.originalname ?? '',
    mimeType: opts.file.mimetype ?? '',
    fileSize: opts.file.size ?? 0,
    uploadedBy: opts.uploadedBy,
  });
}

/** Normalize a (possibly lean) record to JSON with `id`. */
function toJson(record: any): any {
  const { _id, ...rest } = record;
  return { ...rest, id: String(_id) };
}

/**
 * POST /api/medical-records — a patient uploads one of their own medical files.
 * Requires a multipart field `file` plus `title` text field.
 */
export const uploadMyRecord = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string; role: string } };
    if (!user?.id) throw new AppError(401, 'Authentication required.');
    if (user.role !== 'patient') {
      throw new AppError(403, 'Only patients can upload their own medical records here.');
    }

    const { title, description, recordType } = readRecordFields(req.body);
    const record = await createRecord({
      patientId: user.id,
      uploadedBy: 'patient',
      file: req.file,
      title,
      description,
      recordType,
    });

    return sendSuccess(res, 201, 'Medical record uploaded', { record: toJson(record) });
  },
);

/**
 * GET /api/medical-records/me — a patient lists their own medical history.
 */
export const myRecords = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string; role: string } };
    if (!user?.id) throw new AppError(401, 'Authentication required.');

    const records = await MedicalRecord.find({ patient: user.id })
      .sort({ createdAt: -1 })
      .populate('doctor', 'name email profileImage')
      .lean();

    return sendSuccess(res, 200, 'Medical records retrieved', {
      records: records.map((r) => toJson(r)),
      count: records.length,
    });
  },
);

/**
 * DELETE /api/medical-records/:id — a patient deletes one of their own records.
 */
export const deleteRecord = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string; role: string } };
    if (!user?.id) throw new AppError(401, 'Authentication required.');
    const { id } = req.params as { id?: string };
    if (!id) throw new AppError(400, 'Record id is required.');

    const record = await MedicalRecord.findById(id);
    if (!record) throw new AppError(404, 'Medical record not found.');

    const isOwner = String(record.patient) === user.id;
    const isAdmin = user.role === 'admin';
    const uploaderIsDoctorActor = user.role === 'doctor' && String(record.doctor) === user.id;
    if (!isOwner && !isAdmin && !uploaderIsDoctorActor) {
      throw new AppError(403, 'You can only delete your own medical records.');
    }

    await record.deleteOne();
    return sendSuccess(res, 200, 'Medical record deleted');
  },
);
/**
 * GET /api/doctor/patients/:patientId/records — a doctor views a patient's
 * records, but only when a medical (appointment) relationship exists.
 */
export const doctorViewPatientRecords = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string } };
    const { patientId } = req.params as { patientId?: string };
    if (!user?.id) throw new AppError(401, 'Authentication required.');
    if (!patientId) throw new AppError(400, 'Patient id is required.');

    await assertDoctorPatientRelationship(user.id, patientId);

    const records = await MedicalRecord.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .populate('doctor', 'name email profileImage')
      .lean();

    return sendSuccess(res, 200, 'Patient medical records retrieved', {
      records: records.map((r) => toJson(r)),
      count: records.length,
    });
  },
);

/**
 * POST /api/doctor/patients/:patientId/records — a doctor uploads a record for
 * a patient they have a relationship with (e.g. a test result they generated).
 */
export const doctorUploadRecord = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string } };
    const { patientId } = req.params as { patientId?: string };
    if (!user?.id) throw new AppError(401, 'Authentication required.');
    if (!patientId) throw new AppError(400, 'Patient id is required.');

    await assertDoctorPatientRelationship(user.id, patientId);

    const { title, description, recordType } = readRecordFields(req.body);
    const record = await createRecord({
      patientId,
      doctorId: user.id,
      uploadedBy: 'doctor',
      file: req.file,
      title,
      description,
      recordType,
    });

    return sendSuccess(res, 201, 'Medical record uploaded', { document: toJson(record) });
  },
);

/** GET /api/admin/records — admin lists records (optionally filtered by patient). */
export const adminListRecords = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string; role: string } };
    if (user?.role !== 'admin') throw new AppError(403, 'Admin access required.');

    const query: Record<string, unknown> = {};
    if (typeof req.query.patientId === 'string' && req.query.patientId) {
      query.patient = req.query.patientId;
    }
    const records = await MedicalRecord.find(query)
      .sort({ createdAt: -1 })
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .lean();

    return sendSuccess(res, 200, 'Medical records retrieved', {
      records: records.map((r) => toJson(r)),
      count: records.length,
    });
  },
);