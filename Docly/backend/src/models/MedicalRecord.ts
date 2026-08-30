import mongoose, {
  type HydratedDocument,
  type Model,
  model,
  models,
  Schema,
  type Types,
} from 'mongoose';

/** Kind of document a patient uploaded as part of their medical history. */
export type MedicalRecordType =
  | 'medical-report'
  | 'lab-report'
  | 'prescription'
  | 'document';

/** Which role created the record (patient self-upload or doctor upload). */
export type RecordUploaderRole = 'patient' | 'doctor';

/** Plain data shape of a MedicalRecord document. */
export interface IMedicalRecord {
  patient: Types.ObjectId; // ref User (role: patient)
  doctor?: Types.ObjectId; // ref User — set when a doctor uploads the record
  title: string;
  description: string;
  recordType: MedicalRecordType;
  fileUrl: string; // secure Cloudinary URL
  filePublicId: string; // Cloudinary public id (for deletion)
  fileName: string;
  mimeType: string;
  fileSize: number; // bytes
  uploadedBy: RecordUploaderRole;
}

export type MedicalRecordDoc = HydratedDocument<IMedicalRecord>;
export type MedicalRecordModel = Model<IMedicalRecord, {}, {}>;

const medicalRecordSchema = new Schema<IMedicalRecord, MedicalRecordModel, {}>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Medical record must reference a patient'],
      index: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description is too long'],
    },
    recordType: {
      type: String,
      enum: ['medical-report', 'lab-report', 'prescription', 'document'],
      default: 'document',
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    filePublicId: { type: String, default: '' },
    fileName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    fileSize: { type: Number, default: 0, min: 0 },
    uploadedBy: {
      type: String,
      enum: ['patient', 'doctor'],
      default: 'patient',
    },
  },
  { timestamps: true },
);

medicalRecordSchema.index({ patient: 1, createdAt: -1 });
medicalRecordSchema.index({ doctor: 1, createdAt: -1 });

medicalRecordSchema.set('toJSON', {
  transform(_doc: unknown, ret: any): Record<string, unknown> {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret as Record<string, unknown>;
  },
});

export const MedicalRecord: MedicalRecordModel =
  (models.MedicalRecord as MedicalRecordModel | undefined) ??
  model<IMedicalRecord, MedicalRecordModel>('MedicalRecord', medicalRecordSchema);