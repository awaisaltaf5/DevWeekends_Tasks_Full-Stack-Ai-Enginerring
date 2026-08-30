import {
  type HydratedDocument,
  type Model,
  model,
  models,
  Schema,
  type Types,
} from 'mongoose';

/** The kind of in-app notification. */
export type NotificationType =
  | 'appointment.booking'
  | 'appointment.cancellation'
  | 'appointment.status_update'
  | 'doctor.approved'
  | 'medical_record.new';

/** Who the notification is addressed to. */
export type NotificationRecipientRole = 'patient' | 'doctor';

/** Plain data shape of a Notification document. */
export interface INotification {
  recipient: Types.ObjectId; // ref User
  recipientRole: NotificationRecipientRole;
  type: NotificationType;
  title: string;
  message: string;
  link?: string; // e.g. "/appointments" or "/prescriptions/123"
  relatedId?: string; // e.g. appointment or prescription id
  read: boolean;
}

export type NotificationDoc = HydratedDocument<INotification>;
export type NotificationModel = Model<INotification, {}, {}>;

const notificationSchema = new Schema<INotification, NotificationModel, {}>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must reference a recipient'],
      index: true,
    },
    recipientRole: {
      type: String,
      enum: ['patient', 'doctor'],
      required: [true, 'Recipient role is required'],
    },
    type: {
      type: String,
      enum: [
        'appointment.booking',
        'appointment.cancellation',
        'appointment.status_update',
        'doctor.approved',
        'medical_record.new',
      ],
      required: [true, 'Notification type is required'],
    },
    title: { type: String, required: [true, 'Title is required'], maxlength: [120, 'Title too long'] },
    message: { type: String, required: [true, 'Message is required'], maxlength: [500, 'Message too long'] },
    link: { type: String, default: '' },
    relatedId: { type: String, default: '' },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

notificationSchema.set('toJSON', {
  transform(_doc: unknown, ret: any): Record<string, unknown> {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret as Record<string, unknown>;
  },
});

export const Notification: NotificationModel =
  (models.Notification as NotificationModel | undefined) ??
  model<INotification, NotificationModel>('Notification', notificationSchema);
