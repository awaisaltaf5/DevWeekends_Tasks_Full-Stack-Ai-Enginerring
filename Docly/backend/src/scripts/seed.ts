import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import { User, Specialty, DoctorProfile, Review } from '../models';
import { connectDB } from '../config/db';
import { fetchPhoto, placeholderAvatar } from '../services/unsplashService';

/* eslint-disable no-console */

/**
 * Seed script for realistic doctor discovery data.
 *
 * Usage:
 *   npm run seed
 *
 * It is idempotent (safe to re-run). Set UNSPLASH_ACCESS_KEY in backend/.env
 * to enrich profiles with real photos; otherwise placeholder avatars are used.
 */

interface CityBase {
  name: string;
  country: string;
  lng: number;
  lat: number;
}

const CITIES: CityBase[] = [
  { name: 'Karachi', country: 'Pakistan', lng: 67.0011, lat: 24.8607 },
  { name: 'Lahore', country: 'Pakistan', lng: 74.3436, lat: 31.5497 },
  { name: 'Islamabad', country: 'Pakistan', lng: 73.0479, lat: 33.6844 },
  { name: 'Dubai', country: 'UAE', lng: 55.2708, lat: 25.2048 },
  { name: 'New York', country: 'United States', lng: -74.006, lat: 40.7128 },
  { name: 'Toronto', country: 'Canada', lng: -79.3832, lat: 43.6532 },
  { name: 'London', country: 'United Kingdom', lng: -0.1276, lat: 51.5074 },
  { name: 'Sydney', country: 'Australia', lng: 151.2093, lat: -33.8688 },
];

interface SpecialtySeed {
  name: string;
  slug: string;
  icon: string;
  description: string;
}

const SPECIALTIES: SpecialtySeed[] = [
  { name: 'Cardiologist', slug: 'cardiologist', icon: 'HeartPulse', description: 'Specialist in diseases of the heart and blood vessels.' },
  { name: 'Dermatologist', slug: 'dermatologist', icon: 'Sparkles', description: 'Treats conditions of the skin, hair, and nails.' },
  { name: 'Dentist', slug: 'dentist', icon: 'Smile', description: 'Oral health, teeth, and gum care.' },
  { name: 'Neurologist', slug: 'neurologist', icon: 'Brain', description: 'Disorders of the brain, spine, and nervous system.' },
  { name: 'Pediatrician', slug: 'pediatrician', icon: 'Baby', description: 'Medical care for infants, children, and adolescents.' },
  { name: 'Psychiatrist', slug: 'psychiatrist', icon: 'HeartHandshake', description: 'Mental health diagnosis and treatment.' },
  { name: 'Orthopedic Surgeon', slug: 'orthopedic-surgeon', icon: 'Bone', description: 'Musculoskeletal system, bones, joints, and ligaments.' },
  { name: 'General Physician', slug: 'general-physician', icon: 'Stethoscope', description: 'Primary care for everyday illnesses and checkups.' },
  { name: 'Gynecologist', slug: 'gynecologist', icon: 'Ribbon', description: 'Women\u2019s reproductive health and pregnancy care.' },
  { name: 'Ophthalmologist', slug: 'ophthalmologist', icon: 'Eye', description: 'Eye and vision care, including surgery.' },
  { name: 'ENT Specialist', slug: 'ent-specialist', icon: 'Ear', description: 'Ear, nose, and throat conditions.' },
  { name: 'Endocrinologist', slug: 'endocrinologist', icon: 'Activity', description: 'Hormonal and metabolic disorders such as diabetes.' },
];

const TITLES = ['Dr.', 'Prof. Dr.'];
const DOCTOR_COUNT = 28;
const REVIEWS_PER_DOCTOR_MIN = 4;
const REVIEWS_PER_DOCTOR_MAX = 9;
const PATIENT_COUNT = 12;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
async function upsertSpecialties(): Promise<void> {
  for (const spec of SPECIALTIES) {
    await Specialty.findOneAndUpdate(
      { slug: spec.slug },
      {
        $set: {
          name: spec.name,
          description: spec.description,
          icon: spec.icon,
          isActive: true,
        },
        $setOnInsert: { slug: spec.slug },
      },
      { upsert: true, returnDocument: 'after' },
    );
  }
}

async function upsertPatient(index: number) {
  const email = `seed.patient.${index}@docly.dev`;
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return existing._id;
  }
  const first = faker.person.firstName();
  const last = faker.person.lastName();
  const user = await User.create({
    name: `${first} ${last}`,
    email,
    password: faker.internet.password({ length: 10 }),
    role: 'patient',
    profileImage: placeholderAvatar(`${first} ${last}`),
  });
  return user._id;
}

function buildAvailability() {
  const days = [1, 2, 3, 4, 5, 6]; // Mon..Sat
  return days.map((day) => {
    const enabled = Math.random() > 0.25;
    return {
      day,
      startTime: faker.helpers.arrayElement(['09:00', '10:00', '11:00']),
      endTime: faker.helpers.arrayElement(['16:00', '17:00', '19:00']),
      slotDuration: 30,
      isAvailable: enabled,
      breaks: enabled
        ? [{ startTime: '13:00', endTime: '14:00' }]
        : [],
    };
  });
}

// Cache specialty ids to avoid extra lookups during seeding.
const specialtyId = (() => {
  const map = new Map<string, string | undefined>();
  return async (slug: string): Promise<string | undefined> => {
    if (!map.has(slug)) {
      const spec = await Specialty.findOne({ slug }).lean();
      map.set(slug, spec ? String(spec._id) : undefined);
    }
    return map.get(slug);
  };
})();
async function buildDoctor(index: number): Promise<void> {
  const specialtySlug = SPECIALTIES[index % SPECIALTIES.length].slug;
  const city = CITIES[index % CITIES.length];
  const title = TITLES[index % TITLES.length];
  const first = faker.person.firstName();
  const last = faker.person.lastName();
  const name = `${title} ${first} ${last}`;
  const email = `seed.doctor.${index}@docly.dev`;
  const slug = slugify(`${title} ${first} ${last} ${index}`);

  // Upsert the doctor user.
  const userDoc = await User.findOneAndUpdate(
    { email },
    { $setOnInsert: { name, email, role: 'doctor' as const, isActive: true } },
    { upsert: true, returnDocument: 'after' },
  );

  const qualDegree = faker.helpers.arrayElement(['MBBS', 'MD', 'FCPS', 'MRCP']);
  const institution = faker.helpers.arrayElement([
    'Aga Khan University',
    'Dow Medical College',
    'King Edward Medical University',
    'Imperial College London',
    'Johns Hopkins School of Medicine',
    'University of Toronto',
  ]);
  const years = faker.number.int({ min: 4, max: 28 });
  const fee = faker.number.int({ min: 800, max: 5000 });
  const visitTypes = faker.helpers.arrayElements(['in-person', 'video'] as const, {
    min: 1,
    max: 2,
  });
  const languages = Array.from(
    new Set([
      ...faker.helpers.arrayElements(['English', 'Urdu', 'Arabic', 'French', 'Spanish'], {
        min: 1,
        max: 3,
      }),
    ]),
  );
  const isVideo = visitTypes.includes('video');

  // Geospatial coordinates with slight jitter around the city centre.
  const offset = () => (Math.random() - 0.5) * 0.12;
  const coords: [number, number] = [
    Number((city.lng + offset()).toFixed(6)),
    Number((city.lat + offset()).toFixed(6)),
  ];
  const clinicName = faker.helpers.arrayElement([
    `${city.name} Medical Center`,
    'CityCare Clinic',
    'Wellness First',
    'Docly Health Plaza',
    `${last} Specialist Clinic`,
  ]);

  let profileImage = placeholderAvatar(name);
  if (isVideo && process.env.UNSPLASH_ACCESS_KEY) {
    profileImage = (await fetchPhoto('doctor portrait', index)) ?? placeholderAvatar(name);
  }

  const specId = await specialtyId(specialtySlug);
  const profile = await DoctorProfile.findOneAndUpdate(
    { user: userDoc._id },
    {
      $set: {
        specialty: new mongoose.Types.ObjectId(specId!),
        slug,
        qualifications: [
          {
            degree: qualDegree,
            institution,
            year: new Date().getFullYear() - years + 3,
          },
          {
            degree: 'Fellowship',
            institution: faker.helpers.arrayElement([
              'Univ. of Health Sciences',
              'Royal College of Physicians',
            ]),
            year: new Date().getFullYear() - 6,
          },
        ],
        yearsOfExperience: years,
        consultationFee: fee,
        bio: faker.lorem.paragraph({ min: 2, max: 4 }),
        clinicName,
        clinicAddress: `${faker.location.street()}, ${city.name}, ${city.country}`,
        location: {
          type: 'Point',
          coordinates: coords,
          city: city.name,
          country: city.country,
        },
        languages,
        profileImage,
        verificationStatus: 'verified',
        visitTypes,
        availability: buildAvailability(),
        isActive: true,
      },
      $setOnInsert: { user: userDoc._id },
    },
    { upsert: true, returnDocument: 'after' },
  );

  // Reviews + derived rating.
  const reviewCount = faker.number.int({
    min: REVIEWS_PER_DOCTOR_MIN,
    max: REVIEWS_PER_DOCTOR_MAX,
  });
  const patientIds = await Promise.all(
    Array.from({ length: PATIENT_COUNT }, (_, i) => upsertPatient(i + 1)),
  );
  await Review.deleteMany({ doctor: profile._id });

  // The (doctor, patient) compound is unique, so each patient may review a
  // given doctor at most once. Shuffle the pool and assign distinct patients
  // to avoid duplicate-key errors while seeding.
  const reviewCountSafe = Math.min(reviewCount, patientIds.length);
  const assignedPatients = [...patientIds].sort(() => Math.random() - 0.5).slice(0, reviewCountSafe);

  let total = 0;
  for (const patient of assignedPatients) {
    const rating = faker.number.int({ min: 3, max: 5 });
    total += rating;
    await Review.create({
      doctor: profile._id,
      patient,
      rating,
      comment: faker.lorem.sentence({ min: 6, max: 18 }),
    });
  }
  const averageRating = reviewCountSafe > 0 ? Number((total / reviewCountSafe).toFixed(1)) : 0;
  await DoctorProfile.updateOne(
    { _id: profile._id },
    { $set: { averageRating, totalRatings: reviewCount } },
  );

  console.log(`  seeded ${name} (${specialtySlug.replaceAll('-', ' ')}, ${years}y, $${fee})`);
}
async function seed(): Promise<void> {
  await connectDB();

  console.log('\n[Docly] Seeding specialties...');
  await upsertSpecialties();

  console.log(`[Docly] Seeding ${DOCTOR_COUNT} doctors...`);
  for (let i = 0; i < DOCTOR_COUNT; i++) {
    try {
      await buildDoctor(i);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  ! failed for doctor #${i}: ${message}`);
    }
  }

  const doctorCount = await DoctorProfile.countDocuments({ verificationStatus: 'verified' });
  const specialtyCount = await Specialty.countDocuments({ isActive: true });
  const reviewCount = await Review.countDocuments();

  console.log('\n[Docly] Seed complete.');
  console.log(`  Specialties: ${specialtyCount}`);
  console.log(`  Verified doctors: ${doctorCount}`);
  console.log(`  Reviews: ${reviewCount}`);

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.log('\n[Docly] No UNSPLASH_ACCESS_KEY set - used placeholder avatars.');
    console.log('  To use real photos, add UNSPLASH_ACCESS_KEY=<your-key> to backend/.env and re-run npm run seed.');
  }

  await mongoose.disconnect();
}

void seed();