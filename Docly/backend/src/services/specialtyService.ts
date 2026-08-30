import { Specialty, DoctorProfile } from '../models';
import { AppError } from '../utils/AppError';

/** A specialty enriched with the number of verified doctors in it. */
export interface SpecialtyWithCount {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  doctorCount: number;
}

/**
 * List active specialties, each with a live doctor count, sorted by name.
 * Aggregates against verified + active doctor profiles so empty specialties
 * don't clutter the filter UI.
 */
export async function listSpecialtiesWithCounts(): Promise<SpecialtyWithCount[]> {
  const counts = await DoctorProfile.aggregate<{
    _id: unknown;
    count: number;
  }>([
    {
      $match: {
        isActive: true,
      },
    },
    {
      $group: {
        _id: '$specialty',
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map<string, number>();
  for (const row of counts) {
    countMap.set(String(row._id), row.count);
  }

  const specialties = await Specialty.find({ isActive: true })
    .sort({ name: 1 })
    .lean();

  return specialties.map((s) => ({
    id: String(s._id),
    name: s.name,
    slug: s.slug,
    description: s.description,
    icon: s.icon,
    doctorCount: countMap.get(String(s._id)) ?? 0,
  }));
}

/** Fetch a single specialty by id, slug, or name (case-insensitive). */
export async function findSpecialtyByRef(ref: string) {
  const specialty = await Specialty.findOne({
    $or: [
      { _id: ref },
      { slug: ref.toLowerCase() },
      { name: { $regex: new RegExp(`^${escapeRegex(ref)}$`, 'i') } },
    ],
    isActive: true,
  });
  if (!specialty) {
    throw new AppError(404, 'Specialty not found');
  }
  return specialty;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}