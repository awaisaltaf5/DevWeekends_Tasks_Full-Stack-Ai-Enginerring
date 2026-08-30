import mongoose, {
  type HydratedDocument,
  type Model,
  model,
  models,
  Schema,
} from 'mongoose';
import bcrypt from 'bcryptjs';
import { type UserRole } from '../types';

/** Plain data shape of a User document (no modifiers). */
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  profileImage: string;
  isActive: boolean;
  recoveryCodes: { hash: string; usedAt?: Date }[];
}

/** Instance methods attached to a User document. */
export interface IUserMethods {
  matchPassword(candidatePassword: string): Promise<boolean>;
}

/** A hydrated User document: its data plus any timestamps/methods. */
export type UserDoc = HydratedDocument<IUser, IUserMethods>;

/** The Mongoose model type, generated from the schema generics below. */
export type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      default: 'patient',
    },
    profileImage: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    recoveryCodes: {
      type: [
        {
          hash: { type: String, required: true },
          usedAt: { type: Date },
        },
      ],
      default: [],
      select: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: false } },
);

// Hash the password before persisting. Only runs when the field is new or
// modified, so profile updates never re-hash an already-hashed value.
userSchema.pre('save', async function (this: UserDoc): Promise<void> {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare a candidate password against the stored hash.
userSchema.methods.matchPassword = async function (
  this: UserDoc,
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never expose the password hash; normalize `_id` -> `id` in JSON output.
userSchema.set('toJSON', {
  transform(_doc: unknown, ret: any): Record<string, unknown> {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.recoveryCodes;
    return ret as Record<string, unknown>;
  },
});

/**
 * Reuse an existing model when hot-reloading to avoid a "model already
 * registered" error. `model<IUser, UserModel>` returns the custom model type.
 */
export const User: UserModel =
  (models.User as UserModel | undefined) ??
  model<IUser, UserModel>('User', userSchema);