import mongoose, {
  type HydratedDocument,
  type Model,
  model,
  models,
  Schema,
  type Types,
} from 'mongoose';

/** Plain data shape of a Review document. */
export interface IReview {
  doctor: Types.ObjectId; // ref DoctorProfile
  patient: Types.ObjectId; // ref User (role: patient)
  rating: number; // 1..5
  comment: string;
}

export type ReviewDoc = HydratedDocument<IReview>;
export type ReviewModel = Model<IReview, {}, {}>;

const reviewSchema = new Schema<IReview, ReviewModel, {}>(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: [true, 'Review must reference a doctor'],
      index: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must reference a patient'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: { type: String, default: '', maxlength: [1000, 'Comment is too long'] },
  },
  { timestamps: true },
);

// A patient may review a doctor at most once.
reviewSchema.index({ doctor: 1, patient: 1 }, { unique: true });

reviewSchema.set('toJSON', {
  transform(_doc: unknown, ret: any): Record<string, unknown> {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret as Record<string, unknown>;
  },
});

export const Review: ReviewModel =
  (models.Review as ReviewModel | undefined) ??
  model<IReview, ReviewModel>('Review', reviewSchema);