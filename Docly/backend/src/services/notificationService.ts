import { Notification, type NotificationDoc, type NotificationType } from '../models';
import { sendEmail, type EmailRecipient } from './emailService';
import { logger } from '../utils/logger';

/**
 * Create an in-app notification and optionally send an email.
 * Email failures are caught/logged and never throw into the caller.
 */
export async function createNotification(opts: {
  recipientId: string;
  recipientRole: 'patient' | 'doctor';
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  relatedId?: string;
  email?: {
    to: EmailRecipient | EmailRecipient[];
    template: string;
    vars: Record<string, unknown>;
  };
}): Promise<NotificationDoc | null> {
  if (!opts.recipientId || opts.recipientId.length !== 24) {
    logger.warn({ type: opts.type }, 'Skipping notification: no valid recipient');
    return null;
  }
  try {
    const notification = await Notification.create({
      recipient: opts.recipientId,
      recipientRole: opts.recipientRole,
      type: opts.type,
      title: opts.title,
      message: opts.message,
      link: opts.link ?? '',
      relatedId: opts.relatedId ?? '',
    });

    // Fire-and-forget email — never blocks the caller.
    if (opts.email) {
      void sendEmail(opts.email.to, opts.email.template, opts.email.vars).catch((err: unknown) => {
        logger.error({ err, type: opts.type }, 'Notification email failed');
      });
    }

    return notification;
  } catch (err) {
    logger.error({ err, type: opts.type }, 'Failed to create notification');
    return null;
  }
}

/**
 * Convenience: notify a patient about an appointment event.
 */
export async function notifyPatientAboutAppointment(opts: {
  patientId: string;
  type: NotificationType;
  title: string;
  message: string;
  appointmentId?: string;
  email?: {
    to: EmailRecipient;
    template: string;
    vars: Record<string, unknown>;
  };
}): Promise<void> {
  await createNotification({
    recipientId: opts.patientId,
    recipientRole: 'patient',
    type: opts.type,
    title: opts.title,
    message: opts.message,
    link: opts.appointmentId ? `/appointments#${opts.appointmentId}` : '/appointments',
    relatedId: opts.appointmentId,
    email: opts.email,
  });
}

/**
 * Convenience: notify a doctor about an appointment event.
 */
export async function notifyDoctorAboutAppointment(opts: {
  doctorId: string;
  type: NotificationType;
  title: string;
  message: string;
  appointmentId?: string;
  email?: {
    to: EmailRecipient;
    template: string;
    vars: Record<string, unknown>;
  };
}): Promise<void> {
  await createNotification({
    recipientId: opts.doctorId,
    recipientRole: 'doctor',
    type: opts.type,
    title: opts.title,
    message: opts.message,
    link: opts.appointmentId ? `/doctor#appointments` : '/doctor',
    relatedId: opts.appointmentId,
    email: opts.email,
  });
}
