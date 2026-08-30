import mongoose, {
  type HydratedDocument,
  type Model,
  model,
  models,
  Schema,
  type Types,
} from 'mongoose';

/** A single qualification entry (degree, institution, year). */
export interface Qualification {
  degree: string;
  institution: string;
  year?: number;
}

/** Weekly availability slot. `day` is 0 (Sunday) .. 6 (Saturday). */
export interface AvailabilityBreak {
  startTime: string; // "13:00"
  endTime: string; // "14:00"
}

export interface AvailabilitySlot {
  day: number;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  slotDuration: number; // minutes
  isAvailable: boolean;
  breaks: AvailabilityBreak[];
}

/** Verification state of a doctor profile. */
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

/** A verification document (degree, licence, certificate) uploaded by a doctor. */
export interface VerificationDocument {
  label: string;
  url: string;
  publicId?: string;
  uploadedAt?: Date;
}

/** Visit/consultation modes a doctor supports. */
export type VisitType = 'in-person' | 'video';

/** Plain data shape of a DoctorProfile document. */
export interface IDoctorProfile {
  user: Types.ObjectId; // ref User (role: doctor)
  specialty: Types.ObjectId; // ref Specialty
  slug: string;
  qualifications: Qualification[];
  yearsOfExperience: number;
  consultationFee: number;
  bio: string;
  clinicName: string;
  clinicAddress: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    area?: string;
    city?: string;
    country?: string;
  };
  languages: string[];
  profileImage: string;
  verificationStatus: VerificationStatus;
  // Admin feedback shown to the doctor; persisted so it survives verification actions.
     verificationMessage?: string;
  verificationUpdatedAt?: Date | null;
   /** Verification documents (degrees, licences) uploaded by the doctor to Cloudinary. */
   verificationDocuments?: VerificationDocument[];
  averageRating: number;
  totalRatings: number;
  visitTypes: VisitType[];
  availability: AvailabilitySlot[];
  blockedDates: Date[]; // dates a doctor temporarily cannot see patients
     isActive: boolean;
   /** Set when an admin removes a doctor — soft-delete. */
   removedAt?: Date | null;
   /** Reason recorded by the admin when removing the doctor. */
   removedReason?: string;
   /** Admin who removed this doctor (id or 'admin_system'). */
   removedBy?: string;
  // Set by the `timestamps: true` schema option (declared for typing).
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type DoctorProfileDoc = HydratedDocument<IDoctorProfile>;
export type DoctorProfileModel = Model<IDoctorProfile, {}, {}>;

const doctorProfileSchema = new Schema<IDoctorProfile, DoctorProfileModel, {}>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor profile must reference a user'],
      unique: true,
    },
    specialty: {
      type: Schema.Types.ObjectId,
      ref: 'Specialty',
      required: [true, 'Doctor profile must reference a specialty'],
    },
    slug: {
      type: String,
      required: [true, 'Doctor slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    qualifications: [
      {
        degree: { type: String, required: true, trim: true },
        institution: { type: String, required: true, trim: true },
        year: { type: Number },
      },
    ],
    yearsOfExperience: { type: Number, default: 0, min: 0, max: 60 },
    consultationFee: { type: Number, default: 0, min: 0 },
    bio: { type: String, default: '', maxlength: [2000, 'Bio is too long'] },
    clinicName: { type: String, default: '', trim: true },
    clinicAddress: { type: String, default: '', trim: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: {
        type: [Number],
        default: [0, 0],
        validate: {
          validator: (value: number[]) => value.length === 2,
          message: 'Location coordinates must be [longitude, latitude]',
        },
      },
      area: { type: String, default: '', trim: true },
      city: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    languages: { type: [String], default: ['English'] },
    profileImage: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationMessage: {
      type: String,
      default: '',
      maxlength: [2000, 'Verification message is too long'],
    },
    verificationUpdatedAt: {
      type: Date,
      default: null,
    },
    verificationDocuments: {
      type: [
        {
          label: { type: String, required: true, trim: true },
          url: { type: String, required: true },
          publicId: { type: String },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0, min: 0 },
    visitTypes: {
      type: [String],
      enum: ['in-person', 'video'],
      default: ['in-person'],
    },
    availability: [
      {
        day: { type: Number, min: 0, max: 6, required: true },
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '17:00' },
        slotDuration: { type: Number, default: 30 },
        isAvailable: { type: Boolean, default: true },
        breaks: [
          {
            startTime: { type: String, default: '' },
            endTime: { type: String, default: '' },
          },
        ],
      },
    ],
    blockedDates: { type: [Date], default: [] },
    isActive: { type: Boolean, default: true },
    removedAt: { type: Date, default: null },
    removedReason: { type: String, default: '', maxlength: [1000, 'Removal reason is too long'] },
    removedBy: { type: String, default: '' },
  },
  { timestamps: true },
);

// Index for Doctor Discovery queries.
doctorProfileSchema.index({ isActive: 1, verificationStatus: 1 });
doctorProfileSchema.index({ specialty: 1 });
doctorProfileSchema.index({ consultationFee: 1 });
doctorProfileSchema.index({ yearsOfExperience: -1 });
doctorProfileSchema.index({ averageRating: -1 });
doctorProfileSchema.index({ isActive: 1, clinicName: 1, clinicAddress: 1 });
doctorProfileSchema.index({ isActive: 1, 'location.city': 1 });
doctorProfileSchema.index({ isActive: 1, 'location.country': 1 });
// 2dsphere index enables geospatial queries (near / within-box).
doctorProfileSchema.index({ location: '2dsphere' });
doctorProfileSchema.index({ isActive: 1, averageRating: -1 });

doctorProfileSchema.set('toJSON', {
  transform(_doc: unknown, ret: any): Record<string, unknown> {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret as Record<string, unknown>;
  },
});

export const DoctorProfile: DoctorProfileModel =
  (models.DoctorProfile as DoctorProfileModel | undefined) ??
  model<IDoctorProfile, DoctorProfileModel>('DoctorProfile', doctorProfileSchema);
