import { type Request, type Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../utils/AppError';
import { Appointment } from '../models';
import { getJitsiConfig, isJitsiConfigured } from '../services/jitsiService';

/**
 * GET /api/video/:appointmentId
 *
 * Returns the meeting config (room name, join URL, and a short-lived Jitsi
 * token) for a video appointment. Only the booking patient or the attending
 * doctor may retrieve it.
 */
export const getVideoMeeting = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { user } = req as { user?: { id: string; role: string; name?: string } };
    if (!user?.id) {
      throw new AppError(401, 'Authentication required.');
    }
    const { appointmentId } = req.params as { appointmentId?: string };
    if (!appointmentId) {
      throw new AppError(400, 'Appointment id is required.');
    }

    const appt = await Appointment.findById(appointmentId)
      .populate('doctorProfile', 'user clinicName')
      .populate('patient', 'name email')
      .lean();
    if (!appt) {
      throw new AppError(404, 'Appointment not found.');
    }

    if (appt.type !== 'video') {
      throw new AppError(400, 'This appointment is not a video consultation.');
    }

    if (appt.status === 'cancelled' || appt.status === 'completed' || appt.status === 'no-show') {
      throw new AppError(400, 'This video consultation is no longer available.');
    }

    const patientUserId = String(
      (appt.patient as unknown as { _id?: unknown })?._id ?? appt.patient,
    );
    const isPatient = patientUserId === user.id;
    const doctorUserId = String(
      (appt.doctorProfile as unknown as { user?: unknown })?.user ?? '',
    );
    const isDoctor = doctorUserId === user.id;
    if (!isPatient && !isDoctor) {
      throw new AppError(
        403,
        'Only the patient and the attending doctor may join this consultation.',
      );
    }

    if (!isJitsiConfigured()) {
      throw new AppError(
        503,
        'Video consultation is not configured. Add JITSI_APP_ID and JITSI_APP_SECRET to the backend environment.',
      );
    }

    const role = isDoctor ? 'host' : 'guest';
    const apptId = String(appt._id);
    const config = getJitsiConfig(apptId, role, user.id, user.name);

    return sendSuccess(res, 200, 'Video meeting details', {
      meeting: {
        appointmentId: apptId,
        room: config.room,
        url: config.url,
        appId: config.appId,
        token: config.token,
        displayName: config.displayName,
        role,
      },
    });
  },
);
