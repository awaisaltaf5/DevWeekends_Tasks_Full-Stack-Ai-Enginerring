import { type Request, type Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';

/**
 * Demo protected endpoints, one per role, to prove role-based access works.
 * Each is mounted with `protect` + the matching `authorize(...)` guard.
 */

/** Requires role `patient`. */
export const patientOnly = (req: Request, res: Response): Response =>
  sendSuccess(res, 200, 'Patient route access granted', {
    accessedBy: (req as { user?: { role?: string } }).user?.role,
  });

/** Requires role `doctor`. */
export const doctorOnly = (req: Request, res: Response): Response =>
  sendSuccess(res, 200, 'Doctor route access granted', {
    accessedBy: (req as { user?: { role?: string } }).user?.role,
  });

/** Requires role `admin`. */
export const adminOnly = (req: Request, res: Response): Response =>
  sendSuccess(res, 200, 'Admin route access granted', {
    accessedBy: (req as { user?: { role?: string } }).user?.role,
  });