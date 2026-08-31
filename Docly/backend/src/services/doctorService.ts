import mongoose, { type PipelineStage } from 'mongoose';
import { DoctorProfile, Specialty, User } from '../models';
import { AppError } from '../utils/AppError';

/** Normalized, validated doctor search inputs. */
export interface DoctorQuery {
  search?: string;
  specialty?: string; // slug or id
  city?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  minFee?: number;
  maxFee?: number;
  minExperience?: number;
  maxExperience?: number;
  minRating?: number;
  sort?: DoctorSort;
  page: number;
  limit: number;
}

export type DoctorSort =
  | 'relevance'
  | 'rating'
  | 'fee-asc'
  | 'fee-desc'
  | 'experience'
  | 'name';

/** Paginated doctor listing payload returned to the client. */
export interface DoctorListResult {
  doctors: unknown[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const EARTH_RADIUS_KM = 6371;

/** Build the Mongoose filter for a validated DoctorQuery object. */
async function buildFilter(q: DoctorQuery): Promise<Record<string, unknown>> {
  // Transparency: only APPROVED (verified) and active doctor profiles are ever
  // exposed on the public discovery surface. Pending/rejected doctors remain
  // hidden until an admin approves them (approve sets verificationStatus ->
  // 'verified' and isActive -> true).
  const filter: Record<string, unknown> = {
    isActive: true,
    verificationStatus: 'verified',
  };

  // Free text and selected location are one OR-based search surface. A
  // location label from a geocoder is therefore additive, never an AND gate.
  const terms = meaningfulTerms([
    ...tokenize(q.search ?? ''),
    ...locationTokens(q.city ?? ''),
  ]);
  if (terms.length > 0) {
    const matchingUsers = await User.find(
      { role: 'doctor', $or: terms.map((term) => ({ name: containsRegex(term) })) },
      { _id: 1 },
    ).lean();
    const matchingSpecialties = await Specialty.find(
      {
        isActive: true,
        $or: terms.flatMap((term) => [
          { name: containsRegex(term) },
          { slug: containsRegex(term) },
        ]),
      },
      { _id: 1 },
    ).lean();
    const userIds = matchingUsers.map((u) => u._id);
    const specialtyIds = matchingSpecialties.map((specialty) => specialty._id);
    filter.$or = terms.flatMap((term) => [
      { user: { $in: userIds } },
      { specialty: { $in: specialtyIds } },
      { clinicName: containsRegex(term) },
      { clinicAddress: containsRegex(term) },
      { bio: containsRegex(term) },
      { 'location.city': containsRegex(term) },
      { 'location.area': containsRegex(term) },
      { 'location.country': containsRegex(term) },
      { slug: containsRegex(term) },
      { 'qualifications.degree': containsRegex(term) },
      { 'qualifications.institution': containsRegex(term) },
    ]);
  }

  // Specialty by slug or id.
  if (q.specialty) {
    const conditions: Record<string, unknown>[] = [{ slug: q.specialty.toLowerCase() }];
    if (mongoose.isValidObjectId(q.specialty)) {
      conditions.push({ _id: q.specialty });
    }
    const spec = await Specialty.findOne({ $or: conditions, isActive: true });
    if (spec) {
      filter.specialty = spec._id;
    } else {
      // Unknown specialty -> return nothing.
      filter.specialty = { $in: [] };
    }
  }

  // Geospatial search by coordinates (lon/lat) within a radius.
  // Text components are authoritative for selected locations so profiles
  // storing only "Islamabad" or "Bhawana" are not lost by geo precision.
  if (terms.length === 0 && typeof q.lat === 'number' && typeof q.lng === 'number') {
    const radiusKm = q.radiusKm && q.radiusKm > 0 ? q.radiusKm : 50;
    filter.location = {
      $geoWithin: {
        $centerSphere: [
          [q.lng, q.lat],
          radiusKm / EARTH_RADIUS_KM,
        ],
      },
    };
  }

  // Fee range.
  const feeRange: Record<string, number> = {};
  if (typeof q.minFee === 'number' && Number.isFinite(q.minFee)) feeRange.$gte = q.minFee;
  if (typeof q.maxFee === 'number' && Number.isFinite(q.maxFee)) feeRange.$lte = q.maxFee;
  if (Object.keys(feeRange).length > 0) filter.consultationFee = feeRange;

  // Experience range.
  const expRange: Record<string, number> = {};
  if (typeof q.minExperience === 'number' && Number.isFinite(q.minExperience)) expRange.$gte = q.minExperience;
  if (typeof q.maxExperience === 'number' && Number.isFinite(q.maxExperience)) expRange.$lte = q.maxExperience;
  if (Object.keys(expRange).length > 0) filter.yearsOfExperience = expRange;

  // Minimum rating (exclude doctors without ratings).
  if (typeof q.minRating === 'number' && q.minRating > 0) {
    filter.averageRating = { $gte: q.minRating };
    filter.totalRatings = { $gte: 1 };
  }

  return filter;
}

/** Resolve a sort key to a Mongo sort spec. */
function resolveSort(sort: DoctorSort | undefined): Record<string, 1 | -1> {
  switch (sort) {
    case 'rating':
      return { averageRating: -1, totalRatings: -1 };
    case 'fee-asc':
      return { consultationFee: 1 };
    case 'fee-desc':
      return { consultationFee: -1 };
    case 'experience':
      return { yearsOfExperience: -1 };
    case 'name':
      return { clinicName: 1 };
    case 'relevance':
    default:
      return { averageRating: -1, totalRatings: -1, createdAt: -1 };
  }
}

/** List active doctors with filters + pagination. Pending profiles are visible
 * while they await review; rejected profiles are deactivated by moderation. */
export async function listDoctors(raw: DoctorQuery): Promise<DoctorListResult> {
  const filter = await buildFilter(raw);
  const sort = resolveSort(raw.sort);
  const searchText = meaningfulTerms([
    ...tokenize(raw.search ?? ''),
    ...locationTokens(raw.city ?? ''),
  ]).join(' ');

  const page = Math.max(raw.page, 1);
  const limit = Math.min(Math.max(raw.limit, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  const useRelevance = Boolean(searchText) && raw.sort === 'relevance';
  const docsPromise = useRelevance
    ? DoctorProfile.aggregate(buildRelevancePipeline(filter, searchText, skip, limit))
    : DoctorProfile.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email profileImage')
      .populate('specialty', 'name slug icon')
      .lean();

  const [total, docs] = await Promise.all([
    DoctorProfile.countDocuments(filter),
    docsPromise,
  ]);

  if (useRelevance) {
    await DoctorProfile.populate(docs, [
      { path: 'user', select: 'name email profileImage' },
      { path: 'specialty', select: 'name slug icon' },
    ]);
  }

  const doctors = docs.map((doc) => serializeListDoctor(doc));

  return {
    doctors,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/** Rank direct profile matches before the normal rating fallback. */
function buildRelevancePipeline(
  filter: Record<string, unknown>,
  term: string,
  skip: number,
  limit: number,
): PipelineStage[] {
  const terms = tokenize(term);
  const scoreField = (field: string, weight: number) => terms.flatMap((value) => [
    { $cond: [{ $regexMatch: { input: stringValue(field), regex: `^${escapeRegex(value)}$`, options: 'i' } }, weight * 6, 0] },
    { $cond: [{ $regexMatch: { input: stringValue(field), regex: `^${escapeRegex(value)}`, options: 'i' } }, weight * 3, 0] },
    { $cond: [{ $regexMatch: { input: stringValue(field), regex: escapeRegex(value), options: 'i' } }, weight, 0] },
  ]);

  const stringValue = (field: string) => ({
    $convert: {
      input: { $ifNull: [`$${field}`, ''] },
      to: 'string',
      onError: '',
      onNull: '',
    },
  });

  return [
    { $match: filter },
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: '__searchUser' } },
    { $lookup: { from: 'specialties', localField: 'specialty', foreignField: '_id', as: '__searchSpecialty' } },
    { $addFields: { __searchName: { $ifNull: [{ $arrayElemAt: ['$__searchUser.name', 0] }, ''] } } },
    { $addFields: { __searchSpecialtyName: { $ifNull: [{ $arrayElemAt: ['$__searchSpecialty.name', 0] }, ''] } } },
    {
      $addFields: {
        __searchScore: {
          $add: [
            ...scoreField('__searchName', 10),
            ...scoreField('__searchSpecialtyName', 9),
            ...scoreField('clinicName', 8),
            ...scoreField('location.city', 7),
            ...scoreField('location.area', 7),
            ...scoreField('clinicAddress', 6),
            ...scoreField('location.country', 4),
            ...scoreField('slug', 5),
            ...scoreField('bio', 2),
            ...scoreField('qualifications.degree', 2),
            ...scoreField('qualifications.institution', 2),
          ],
        },
      },
    },
    { $sort: { __searchScore: -1, averageRating: -1, totalRatings: -1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    { $project: { __searchScore: 0, __searchName: 0, __searchUser: 0, __searchSpecialty: 0, __searchSpecialtyName: 0 } },
  ];
}

function tokenize(value: string): string[] {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);
}

function locationTokens(value: string): string[] {
  return value
    .split(',')
    .flatMap((part) => tokenize(part))
    .filter((term) => term.length > 1);
}

function uniqueTerms(terms: string[]): string[] {
  return [...new Set(terms)];
}

function meaningfulTerms(terms: string[]): string[] {
  const unique = uniqueTerms(terms);
  const useful = unique.filter((term) => ![
    'a', 'an', 'and', 'at', 'doctor', 'doctors', 'dr', 'in', 'near', 'no', 'or', 'physician', 'the',
  ].includes(term));
  return useful.length > 0 ? useful : unique;
}

function containsRegex(value: string): RegExp {
  return new RegExp(escapeRegex(value), 'i');
}

/** Normalize a lean doctor document into a stable client shape with `id`. */
function serializeListDoctor(doc: Record<string, any>): Record<string, any> {
  const user = doc.user as Record<string, any> | undefined;
  const specialty = doc.specialty as Record<string, any> | undefined;
  return {
    ...doc,
    id: stringifyId(doc._id),
    user: user
      ? { id: stringifyId(user._id), name: user.name, email: user.email, profileImage: user.profileImage }
      : undefined,
    specialty: specialty
      ? { id: stringifyId(specialty._id), name: specialty.name, slug: specialty.slug, icon: specialty.icon }
      : undefined,
  };
}

function stringifyId(value: unknown): string {
  return value != null ? String(value) : '';
}

/** Fetch a single doctor profile by id or slug (populated). */
export async function getDoctorByRef(ref: string) {
  if (!ref) {
    throw new AppError(400, 'Doctor id or slug is required');
  }
  const conditions: Record<string, unknown>[] = [{ slug: ref.toLowerCase() }];
  if (mongoose.isValidObjectId(ref)) {
    conditions.push({ _id: ref });
  }
  const profile = await DoctorProfile.findOne({
    $or: conditions,
    isActive: true,
    // Public doctor detail pages only surface approved doctors (transparency).
    verificationStatus: 'verified',
  })
    .populate('user', 'name email profileImage')
    .populate('specialty', 'name slug icon description');

  if (!profile) {
    throw new AppError(404, 'Doctor not found');
  }
  return profile;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export { DEFAULT_PAGE, DEFAULT_LIMIT };