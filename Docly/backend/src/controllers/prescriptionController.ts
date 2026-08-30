import { type Request, type Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../utils/AppError';
import { Prescription } from '../models';
import {
  assertDoctorPatientRelationship,
  doctorProfileIdForUser,
  loadPatientOr404,
  parseMedicines,
} from '../services/medicalService';

function readText(body: unknown, key: string): string | undefined {
  if (body && typeof body === 'object') {
    const v = (body as Record<string, unknown>)[key];
    if (typeof v === 'string') return v;
  }
  return undefined;
}

/** Normalize a (possibly lean) prescription to JSON with `id`. */
function toJson(p: any): any {
  const { _id, ...rest } = p;
  return { ...rest, id: String(_id) };
}

/**
 * POST /api/doctor/prescriptions — a doctor creates consultation info for a
 * patient they have a medical relationship with.
 */
export const createPrescription = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string } };
    if (!user?.id) throw new AppError(401, 'Authentication required.');

    const body = (req.body ?? {}) as Record<string, unknown>;
    const patientId = typeof body.patientId === 'string' ? body.patientId : '';
    if (!patientId) throw new AppError(400, 'patientId is required.');
    await loadPatientOr404(patientId);

    await assertDoctorPatientRelationship(user.id, patientId);

    const profileId = await doctorProfileIdForUser(user.id);
    const medicines = parseMedicines(body.medicines);

    const diagnosis = readText(body, 'diagnosis')?.trim() ?? '';
    const notes = readText(body, 'notes')?.trim() ?? '';
    const appointmentId = typeof body.appointmentId === 'string' ? body.appointmentId : undefined;
    if (appointmentId && !/^[0-9a-fA-F]{24}$/.test(appointmentId)) {
      throw new AppError(400, 'Invalid appointment id.');
    }

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: user.id,
      doctorProfile: profileId,
      appointment: appointmentId ?? undefined,
      diagnosis,
      notes,
      medicines,
    });

    return sendSuccess(res, 201, 'Prescription created', {
      prescription: toJson(prescription.toObject()),
    });
  },
);

/**
 * GET /api/doctor/prescriptions — list prescriptions the doctor created,
 * optionally filtered to a specific patient.
 */
export const doctorPrescriptions = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string } };
    if (!user?.id) throw new AppError(401, 'Authentication required.');

    const query: Record<string, unknown> = { doctor: user.id };
    if (typeof req.query.patientId === 'string' && req.query.patientId) {
      query.patient = req.query.patientId;
    }

    const prescriptions = await Prescription.find(query)
      .sort({ createdAt: -1 })
      .populate('patient', 'name email profileImage')
      .lean();

    return sendSuccess(res, 200, 'Prescriptions retrieved', {
      prescriptions: prescriptions.map((p) => toJson(p)),
      count: prescriptions.length,
    });
  },
);

/**
 * GET /api/doctor/prescriptions/:id — a doctor views a prescription they
 * authored, or written for a patient they have a relationship with.
 */
export const doctorPrescriptionDetail = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string } };
    const { id } = req.params as { id?: string };
    if (!user?.id) throw new AppError(401, 'Authentication required.');
    if (!id) throw new AppError(400, 'Prescription id is required.');

    const prescription = await Prescription.findById(id)
      .populate('patient', 'name email profileImage')
      .populate('doctor', 'name email profileImage')
      .populate('doctorProfile', 'clinicName consultationFee user')
      .populate('appointment', 'date startTime endTime type')
      .lean();
    if (!prescription) throw new AppError(404, 'Prescription not found.');

    const authored = String((prescription as { doctor: unknown }).doctor) === user.id;
    if (!authored) {
      await assertDoctorPatientRelationship(
        user.id,
        String((prescription as { patient: unknown }).patient),
      );
    }

    return sendSuccess(res, 200, 'Prescription retrieved', {
      prescription: toJson(prescription),
    });
  },
);

/**
 * GET /api/prescriptions/me — a patient lists their own prescriptions.
 */
export const myPrescriptions = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string } };
    if (!user?.id) throw new AppError(401, 'Authentication required.');

    const prescriptions = await Prescription.find({ patient: user.id })
      .sort({ createdAt: -1 })
      .populate('doctor', 'name email profileImage')
      .populate('doctorProfile', 'clinicName consultationFee specialty')
      .populate('appointment', 'date startTime endTime type')
      .lean();

    return sendSuccess(res, 200, 'Prescriptions retrieved', {
      prescriptions: prescriptions.map((p) => toJson(p)),
      count: prescriptions.length,
    });
  },
);

/**
 * GET /api/prescriptions/:id — authorized viewers (patient owner, prescribing
 * doctor, or admin) view a prescription.
 */
export const patientPrescriptionDetail = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string; role: string } };
    const { id } = req.params as { id?: string };
    if (!user?.id) throw new AppError(401, 'Authentication required.');
    if (!id) throw new AppError(400, 'Prescription id is required.');

    const prescription = await Prescription.findById(id)
      .populate('doctor', 'name email profileImage')
      .populate('doctorProfile', 'clinicName consultationFee specialty')
      .populate('appointment', 'date startTime endTime type')
      .lean();
    if (!prescription) throw new AppError(404, 'Prescription not found.');

    const isOwner = String((prescription as { patient: unknown }).patient) === user.id;
    const isAuthor = user.role === 'doctor' && String((prescription as { doctor: unknown }).doctor) === user.id;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAuthor && !isAdmin) {
      throw new AppError(403, 'You do not have access to this prescription.');
    }

    return sendSuccess(res, 200, 'Prescription retrieved', {
      prescription: toJson(prescription),
    });
  },
);

/** GET /api/admin/prescriptions — admin lists prescriptions (optionally filtered). */
export const adminListPrescriptions = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string; role: string } };
    if (user?.role !== 'admin') throw new AppError(403, 'Admin access required.');

    const query: Record<string, unknown> = {};
    if (typeof req.query.patientId === 'string' && req.query.patientId) {
      query.patient = req.query.patientId;
    }
    if (typeof req.query.doctorId === 'string' && req.query.doctorId) {
      query.doctor = req.query.doctorId;
    }

    const prescriptions = await Prescription.find(query)
      .sort({ createdAt: -1 })
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .lean();

    return sendSuccess(res, 200, 'Prescriptions retrieved', {
      prescriptions: prescriptions.map((p) => toJson(p)),
      count: prescriptions.length,
    });
  },
);