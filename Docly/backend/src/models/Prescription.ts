import mongoose, {
  type HydratedDocument,
  type Model,
  model,
  models,
  Schema,
  type Types,
} from 'mongoose';

/** A single medicine entry on a prescription. */
export interface Medicine {
  name: string;
  dosage: string;
  instructions: string;
  days?: number;
}

/** Plain data shape of a Prescription document. */
export interface IPrescription {
  patient: Types.ObjectId; // ref User (role: patient)
  doctor: Types.ObjectId; // ref User (the prescribing doctor)
  doctorProfile: Types.ObjectId; // ref DoctorProfile
  appointment?: Types.ObjectId; // ref Appointment (optional context)
  diagnosis: string;
  notes: string;
  medicines: Medicine[];
}

export type PrescriptionDoc = HydratedDocument<IPrescription>;
export type PrescriptionModel = Model<IPrescription, {}, {}>;

const medicineSchema = new Schema<Medicine>(
  {
    name: { type: String, required: true, trim: true },
    dosage: { type: String, default: '' },
    instructions: { type: String, default: '' },
    days: { type: Number, min: 1 },
  },
  { _id: false },
);

const prescriptionSchema = new Schema<IPrescription, PrescriptionModel, {}>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Prescription must reference a patient'],
      index: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Prescription must reference a doctor'],
      index: true,
    },
    doctorProfile: {
      type: Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: [true, 'Prescription must reference a doctor profile'],
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    diagnosis: {
      type: String,
      default: '',
      maxlength: [2000, 'Diagnosis is too long'],
    },
    notes: {
      type: String,
      default: '',
      maxlength: [3000, 'Notes are too long'],
    },
    medicines: { type: [medicineSchema], default: [] },
  },
  { timestamps: true },
);

prescriptionSchema.index({ patient: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });
prescriptionSchema.index({ doctorProfile: 1, createdAt: -1 });

prescriptionSchema.set('toJSON', {
  transform(_doc: unknown, ret: any): Record<string, unknown> {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret as Record<string, unknown>;
  },
});

export const Prescription: PrescriptionModel =
  (models.Prescription as PrescriptionModel | undefined) ??
  model<IPrescription, PrescriptionModel>('Prescription', prescriptionSchema);