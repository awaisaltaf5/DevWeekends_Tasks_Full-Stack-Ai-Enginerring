import { type Request, type Response, type NextFunction } from 'express';
import {
  listDoctors,
  getDoctorByRef,
  type DoctorQuery,
  type DoctorSort,
} from '../services/doctorService';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../middleware/errorHandler';

function toNumber(value: unknown): number | undefined {
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function toSort(value: unknown): DoctorSort | undefined {
  const s = String(value ?? '');
  const allowed: DoctorSort[] = [
    'relevance',
    'rating',
    'fee-asc',
    'fee-desc',
    'experience',
    'name',
  ];
  return allowed.includes(s as DoctorSort) ? (s as DoctorSort) : undefined;
}

function readDoctorQuery(query: Request['query']): DoctorQuery {
  const page = toNumber(query.page);
  const limit = toNumber(query.limit);
  return {
    search: typeof query.search === 'string' ? query.search : undefined,
    specialty: typeof query.specialty === 'string' ? query.specialty : undefined,
    city: typeof query.city === 'string' ? query.city : undefined,
    lat: toNumber(query.lat),
    lng: toNumber(query.lng),
    radiusKm: toNumber(query.radiusKm),
    minFee: toNumber(query.minFee),
    maxFee: toNumber(query.maxFee),
    minExperience: toNumber(query.minExperience),
    maxExperience: toNumber(query.maxExperience),
    minRating: toNumber(query.minRating),
    sort: toSort(query.sort),
    page: page ?? 1,
    limit: limit ?? 10,
  };
}

/** GET /api/doctors — list active doctors with filters + pagination. */
export const getDoctors = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<Response> => {
    const result = await listDoctors(readDoctorQuery(req.query));
    return sendSuccess(res, 200, 'Doctors retrieved', {
      doctors: result.doctors,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  },
);

/** GET /api/doctors/:id -- fetch a single doctor by id or slug. */
export const getDoctor = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<Response> => {
    const idParam = req.params.id;
    const ref = Array.isArray(idParam) ? idParam[0] : idParam ?? '';
    const doctor = await getDoctorByRef(ref);
    return sendSuccess(res, 200, 'Doctor retrieved', { doctor });
  },
);