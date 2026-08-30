import { type Request, type Response } from 'express';
import { listSpecialtiesWithCounts } from '../services/specialtyService';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';

/** GET /api/specialties — list active specialties with doctor counts. */
export const getSpecialties = asyncHandler(
  async (_req: Request, res: Response): Promise<Response> => {
    const specialties = await listSpecialtiesWithCounts();
    return sendSuccess(res, 200, 'Specialties retrieved', {
      specialties,
      count: specialties.length,
    });
  },
);