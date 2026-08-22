const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User model for the StayNest hotel booking system.
 *
 * Security notes:
 *  - `password` is `select: false` so it is never sent by default.
 *  - A `pre('save')` hook hashes the password with bcryptjs (10 rounds)
 *    only when it is new or modified.
 *  - `matchPassword` is an instance method used by the login controller.
 *  - The `toJSON` transform deletes `password` and maps `_id` -> `id`, so
 *    the user object returned by any controller never leaks the hash.
 */
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    preferences: {
      currency: {
        type: String,
        enum: ['PKR', 'USD', 'EUR', 'GBP'],
        default: 'PKR',
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

// Hash password before persisting.
// Mongoose 9 async middleware should return a promise (not call next()).
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare a candidate password against the stored hash.
UserSchema.methods.matchPassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never expose the password hash; normalize _id -> id in JSON output.
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
