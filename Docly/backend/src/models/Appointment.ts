import mongoose, {
  type HydratedDocument,
  type Model,
  model,
  models,
  Schema,
  type Types,
} from 'mongoose';

/** Appointment status lifecycle. */
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'no-show';

/** Consultation mode for an appointment. */
export type AppointmentType = 'in-person' | 'video';

/** Plain data shape of an Appointment document. */
export interface IAppointment {
  patient: Types.ObjectId; // ref User (role: patient)
  doctorProfile: Types.ObjectId; // ref DoctorProfile
  doctor: Types.ObjectId; // ref User (doctor, for convenience)
  specialty: Types.ObjectId; // ref Specialty
  date: Date;
  startTime: string; // "14:30"
  endTime: string; // "15:00"
  type: AppointmentType;
  status: AppointmentStatus;
       reason: string;
  notes: string;
   /** Consultation fee charged for this appointment (copied from doctor at booking). */
  fee?: number;
  meetingUrl: string; // telemedicine link (video appointments)
  meetingId: string; // unique Jitsi room name
  meetingToken: string; // short-lived Jitsi participant token
  patientContact: {
    phone: string;
    email: string;
  };
}

export type AppointmentDoc = HydratedDocument<IAppointment>;
export type AppointmentModel = Model<IAppointment, {}, {}>;

const appointmentSchema = new Schema<IAppointment, AppointmentModel, {}>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Appointment must reference a patient'],
      index: true,
    },
    doctorProfile: {
      type: Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: [true, 'Appointment must reference a doctor profile'],
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Appointment must reference a doctor user'],
      index: true,
    },
    specialty: {
      type: Schema.Types.ObjectId,
      ref: 'Specialty',
      required: [true, 'Appointment must reference a specialty'],
    },
    date: { type: Date, required: [true, 'Appointment date is required'] },
    startTime: { type: String, required: [true, 'Start time is required'] },
    endTime: { type: String, required: [true, 'End time is required'] },
    type: { type: String, enum: ['in-person', 'video'], default: 'in-person' },
        status: {
      type: String,
      enum: ['pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
        reason: { type: String, default: '', maxlength: [500, 'Reason is too long'] },
    notes: { type: String, default: '' },
    fee: { type: Number, default: 0, min: 0 },
        meetingUrl: { type: String, default: '' },
    meetingId: { type: String, default: '' },
    meetingToken: { type: String, default: '' },
    patientContact: {
      phone: { type: String, default: '' },
      email: { type: String, default: '', lowercase: true, trim: true },
    },
  },
  { timestamps: true },
);

appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctorProfile: 1, date: 1 });

/**
 * Real-time double-booking prevention.
 *
 * No two non-cancelled appointments may occupy the same doctor + day + time
 * window. Mongo enforces this atomically at insert time (E11000), so two
 * patients racing to book the same slot cannot both succeed — even when the
 * check-then-create race in the controller happens concurrently.
 */
appointmentSchema.index(
  { doctorProfile: 1, date: 1, startTime: 1, endTime: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } },
);

appointmentSchema.set('toJSON', {
  transform(_doc: unknown, ret: any): Record<string, unknown> {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret as Record<string, unknown>;
  },
});

export const Appointment: AppointmentModel =
  (models.Appointment as AppointmentModel | undefined) ??
  model<IAppointment, AppointmentModel>('Appointment', appointmentSchema);