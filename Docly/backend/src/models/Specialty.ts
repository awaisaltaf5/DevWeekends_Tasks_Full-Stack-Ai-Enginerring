import mongoose, {
  type HydratedDocument,
  type Model,
  model,
  models,
  Schema,
} from 'mongoose';

/** Plain data shape of a Specialty document. */
export interface ISpecialty {
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
}

export type SpecialtyDoc = HydratedDocument<ISpecialty>;
export type SpecialtyModel = Model<ISpecialty, {}, {}>;

const specialtySchema = new Schema<ISpecialty, SpecialtyModel, {}>(
  {
    name: {
      type: String,
      required: [true, 'Specialty name is required'],
      trim: true,
      maxlength: [80, 'Specialty name cannot exceed 80 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Specialty slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    icon: {
      type: String,
      default: 'Stethoscope',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

specialtySchema.index({ name: 1 });

specialtySchema.set('toJSON', {
  transform(_doc: unknown, ret: any): Record<string, unknown> {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret as Record<string, unknown>;
  },
});

export const Specialty: SpecialtyModel =
  (models.Specialty as SpecialtyModel | undefined) ??
  model<ISpecialty, SpecialtyModel>('Specialty', specialtySchema);
