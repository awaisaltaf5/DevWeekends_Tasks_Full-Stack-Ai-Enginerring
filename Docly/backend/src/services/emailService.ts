import { env } from '../config/env';
import { logger } from '../utils/logger';
import nodemailer from 'nodemailer';

/**
 * Email sending via Brevo SMTP, with Resend as a fallback.
 *
 * Credentials are read from env only — never hardcoded:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (Brevo SMTP credentials)
 *   RESEND_API_KEY (optional fallback)
 *   EMAIL_FROM (verified sender)
 *
 * When Resend is not configured, `sendEmail` is a no-op that logs a warning —
 * so the appointment flow is never broken by email provider issues.
 */
export function isEmailConfigured(): boolean {
  return isSmtpConfigured() || Boolean(env.resendApiKey);
}

function isSmtpConfigured(): boolean {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPass && env.smtpPort);
}

export interface EmailRecipient {
  name?: string;
  email: string;
}

export interface EmailVars {
  [key: string]: unknown;
}

/** Base HTML wrapper for all emails — clean, minimal, professional. */
function wrapEmailHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
body { margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#f5f7fa; color:#1a1a1a; }
.wrapper { max-width:600px; margin:40px auto; padding:24px; }
.card { background:#fff; border-radius:12px; padding:32px; box-shadow:0 4px 12px rgba(0,0,0,.05); }
.header { display:flex; align-items:center; gap:12px; margin-bottom:24px; }
.logo { width:40px; height:40px; background:#2563eb; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; }
.title { font-size:20px; font-weight:700; margin:0; }
.subtitle { color:#6b7280; font-size:14px; margin:0 0 16px; }
.btn { display:inline-block; background:#2563eb; color:#fff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:600; font-size:14px; }
.btn-secondary { background:#f3f4f6; color:#374151; }
.content p { margin:0 0 12px; line-height:1.6; }
.footer { margin-top:24px; padding-top:16px; border-top:1px solid #e5e7eb; font-size:12px; color:#9ca3af; }
.badge { display:inline-block; padding:4px 8px; border-radius:4px; font-size:12px; font-weight:600; }
.badge-video { background:#dbeafe; color:#2563eb; }
.badge-inperson { background:#dcfce8; color:#16a34a; }
</style></head>
<body><div class="wrapper"><div class="card">
<div class="header"><div class="logo">D</div><div><h1 class="title">Docly</h1><p class="subtitle">${title}</p></div></div>
<div class="content">${body}</div>
</div><div class="footer"><p>This email was sent by Docly. If you did not expect this email, please ignore it.</p></div></div></body></html>`;
}
/** Template for appointment booking confirmation. */
function bookingConfirmationEmail(vars: EmailVars): string {
  const doctor = (vars.doctor as { name: string }) ?? { name: 'your doctor' };
  const date = vars.date as string;
  const time = vars.time as string;
  const type = (vars.type as string) ?? 'in-person';
  const fee = vars.fee as number;
  const meetingUrl = vars.meetingUrl as string;
  const appUrl = (vars.appUrl as string) ?? env.clientUrl;
  const typeBadge =
    type === 'video'
      ? '<span class="badge badge-video">Video Consultation</span>'
      : '<span class="badge badge-inperson">In-person Visit</span>';
  return wrapEmailHtml('Appointment Booking Confirmation', `
    <p>Hi ${(vars.patientName as string) ?? 'there'},</p>
    <p>Your appointment has been <strong>confirmed</strong>.</p>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;border:1px solid #e5e7eb;margin:16px 0;">
      <p style="margin:4px 0;"><strong>${doctor.name}</strong> ${typeBadge}</p>
      <p style="margin:4px 0;"><strong>Date and time:</strong> ${date} at ${time}</p>
      ${type === 'video' && meetingUrl ? `<p style="margin:4px 0;"><a href="${meetingUrl}">Join video consultation</a></p>` : ''}
      <p style="margin:4px 0;"><strong>Fee:</strong> Rs. ${fee}</p>
    </div>
    ${type === 'video' && meetingUrl ? `<p style="text-align:center;"><a href="${meetingUrl}" class="btn">Join Consultation</a></p>` : ''}
    <p>You can view and manage this appointment in your <a href="${appUrl}/appointments" class="btn btn-secondary">My Appointments</a> page.</p>
    <p>If you need to cancel or reschedule, please do so at least 24 hours in advance.</p>
  `);
}

/** Template for the doctor's new appointment notification. */
function doctorBookingNotificationEmail(vars: EmailVars): string {
  const doctorName = (vars.doctorName as string) ?? 'Doctor';
  const patientName = (vars.patientName as string) ?? 'A patient';
  const type = (vars.type as string) ?? 'in-person';
  const meetingUrl = vars.meetingUrl as string;
  const appUrl = (vars.appUrl as string) ?? env.clientUrl;
  return wrapEmailHtml('New Appointment Booked', `
    <p>Hello ${doctorName},</p>
    <p>A new appointment has been booked with you on Docly.</p>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;border:1px solid #e5e7eb;margin:16px 0;">
      <p style="margin:4px 0;"><strong>Patient:</strong> ${patientName}</p>
      <p style="margin:4px 0;"><strong>Date and time:</strong> ${vars.date as string} at ${vars.time as string}</p>
      <p style="margin:4px 0;"><strong>Visit type:</strong> ${type === 'video' ? 'Video consultation' : 'In-person visit'}</p>
      <p style="margin:4px 0;"><strong>Fee:</strong> Rs. ${vars.fee as number}</p>
      ${vars.reason ? `<p style="margin:4px 0;"><strong>Reason:</strong> ${vars.reason as string}</p>` : ''}
      ${vars.clinicName ? `<p style="margin:4px 0;"><strong>Clinic:</strong> ${vars.clinicName as string}</p>` : ''}
    </div>
    ${type === 'video' && meetingUrl ? `<p style="text-align:center;"><a href="${meetingUrl}" class="btn">Open Consultation</a></p>` : ''}
    <p style="text-align:center;"><a href="${appUrl}/doctor?tab=appointments" class="btn btn-secondary">View Appointments</a></p>
  `);
}

/** Template for appointment cancellation. */
function appointmentCancellationEmail(vars: EmailVars): string {
  const doctor = (vars.doctor as { name: string }) ?? { name: 'your doctor' };
  return wrapEmailHtml('Appointment Cancelled', `
    <p>Hi ${(vars.patientName as string) ?? 'there'},</p>
    <p>Your appointment with <strong>${doctor.name}</strong> scheduled for
      <strong> ${vars.date as string} at ${vars.time as string}</strong> has been <strong>cancelled</strong>.</p>
    ${vars.reason ? `<p>Reason: ${vars.reason as string}</p>` : ''}
    <p style="text-align:center;"><a href="${env.clientUrl}/doctors" class="btn">Book another appointment</a></p>
  `);
}
/** Template for appointment status update. */
function appointmentStatusUpdateEmail(vars: EmailVars): string {
  const status = (vars.status as string) ?? 'updated';
  const doctor = (vars.doctor as { name: string }) ?? { name: 'your doctor' };
  return wrapEmailHtml('Appointment Status Updated', `
    <p>Hi ${(vars.patientName as string) ?? 'there'},</p>
    <p>Your appointment with <strong>${doctor.name}</strong> on <strong>${vars.date as string}</strong>
      at <strong>${vars.time as string}</strong> has been <strong>${status}</strong>.</p>
    <p style="text-align:center;"><a href="${env.clientUrl}/appointments" class="btn">View in My Appointments</a></p>
    ${vars.notes ? `<p>Notes: ${vars.notes as string}</p>` : ''}
  `);
}

/** Template for doctor account approval. */
function doctorApprovedEmail(vars: EmailVars): string {
  const name = (vars.name as string) ?? 'Doctor';
  return wrapEmailHtml('Doctor Account Approved', `
    <p>Hello Dr. ${name},</p>
    <p>Congratulations! Your Docly doctor account has been <strong>approved</strong> by our team.</p>
    <p>You can now log in to your <a href="${env.clientUrl}/doctor" class="btn">Doctor Dashboard</a>
              to manage appointments, set your availability, and update your profile.</p>
    <p style=\"text-align:center;\"><a href=\"${env.clientUrl}/doctor\" class=\"btn\">Go to Dashboard</a></p>
  `);
}

/** Template for doctor rejection / changes-requested notification. */
function doctorRejectedOrChangesEmail(vars: EmailVars): string {
  const name = (vars.name as string) ?? 'Doctor';
  const isRejection = Boolean(vars.isRejection);
  const message = (vars.message as string) ?? '';
  const dashboardUrl = (vars.dashboardUrl as string) ?? `${env.clientUrl}/doctor`;
  const heading = isRejection ? 'Doctor Profile Rejected' : 'Changes Requested for Your Profile';
  const safeMessage = String(message).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const body = `
    <p>Hello Dr. ${name},</p>
    ${isRejection
      ? `<p>Your Docly doctor profile has been <strong>rejected</strong> and is no longer active.</p>`
      : `<p>Your Docly doctor profile needs <strong>additional information</strong> before it can be approved.</p>`}
    ${message ? `<blockquote style='margin:16px 0;padding:16px 20px;border-left:3px solid #f59e0b;background:#fffbeb;border-radius:0 6px 6px 0;'><p style='margin:0;font-style:italic;color:#78350f;'>${safeMessage}</p></blockquote>` : ''}
    ${isRejection
      ? `<p>If you believe this was done in error or have questions, please contact our support team at <a href='mailto:support@docly.com'>support@docly.com</a>.</p>`
      : `<p>Please review the feedback above and update your profile accordingly. You can edit your profile in your <a href='${dashboardUrl}' class='btn'>Doctor Dashboard</a>.</p>`}
    <p>— The Docly Team</p>
  `;
  return wrapEmailHtml(heading, body);
}

/** Template for doctor profile removal (soft-delete) notification. */
function doctorRemovedEmail(vars: EmailVars): string {
  const doctorName = (vars.doctorName as string) ?? 'Doctor';
    const removalReason = (vars.removalReason as string) ?? 'No reason provided.';
  return wrapEmailHtml('Doctor Profile Removed', `
    <p>Dear Dr. ${doctorName},</p>
    <p>We regret to inform you that your Docly doctor profile has been <strong>removed</strong> from the platform.</p>
    <p><strong>Reason for removal:</strong></p>
    <blockquote style=\"margin:16px 0;padding:16px 20px;border-left:3px solid #ef4444;background:#fef2f2;border-radius:0 6px 6px 0;\">
      <p style=\"margin:0;font-style:italic;color:#7f1d1d;\">${removalReason.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
    </blockquote>
    <p>If you believe this was in error or have questions, please contact our support team at <a href=\"mailto:support@docly.com\">support@docly.com</a>.</p>
    <p>Thank you for your time and effort on Docly.</p>
    <p>— The Docly Team</p>
  `);
}

const EMAIL_TEMPLATES: Record<string, (v: EmailVars) => string> = {
  'appointment.booking': bookingConfirmationEmail,
  'appointment.booking.doctor': doctorBookingNotificationEmail,
  'appointment.cancellation': appointmentCancellationEmail,
  'appointment.status_update': appointmentStatusUpdateEmail,
    'doctor.approved': doctorApprovedEmail,
  'doctor.rejected': doctorRejectedOrChangesEmail,
  'doctor.request_changes': doctorRejectedOrChangesEmail,
  'doctor.removed': doctorRemovedEmail,
};

/**
 * Send an email via Resend.
 * Failures are logged but never thrown — the calling flow continues.
 */
export async function sendEmail(
  to: EmailRecipient | EmailRecipient[],
  template: string,
  vars: EmailVars,
): Promise<{ sent: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    logger.warn({ template, recipient: Array.isArray(to) ? to.length : to.email }, 'Email not sent — no SMTP or Resend configuration');
    return { sent: false, error: 'Resend not configured' };
  }

  const render = EMAIL_TEMPLATES[template];
  if (!render) {
    logger.error({ template }, 'sendEmail: unknown email template');
    return { sent: false, error: 'Unknown email template' };
  }

  const html = render(vars);
  const subject = emailSubject(template);
  const recipients = Array.isArray(to) ? to : [to];

  try {
    if (isSmtpConfigured()) {
      const transporter = nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpPort === 465,
        auth: { user: env.smtpUser, pass: env.smtpPass },
      });
      const info = await transporter.sendMail({
        from: env.emailFrom,
        to: recipients.map((r) => `${r.name ? r.name + ' ' : ''}<${r.email}>`).join(', '),
        subject,
        html,
      });
      logger.info({ template, messageId: info.messageId }, 'Email sent via SMTP');
      return { sent: true };
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Resend } = require('resend');
    const resend = new Resend(env.resendApiKey);
    const { data, error } = await resend.emails.send({
      from: env.emailFrom,
      to: recipients.map((r) => `${r.name ? r.name + ' ' : ''}<${r.email}>`).join(', '),
      subject,
      html,
    });
    if (error) {
      logger.error({ template, error }, 'Email send failed (Resend error)');
      return { sent: false, error: String(error) };
    }
    logger.info({ template, messageId: data?.id }, 'Email sent');
    return { sent: true };
  } catch (err) {
    logger.error({ template, err }, 'Email send failed (exception)');
    return { sent: false, error: String(err) };
  }
}

function emailSubject(template: string): string {
  switch (template) {
    case 'appointment.booking':
      return 'Your Docly appointment is confirmed';
    case 'appointment.booking.doctor':
      return 'New appointment booked on Docly';
    case 'appointment.cancellation':
      return 'Your appointment has been cancelled';
    case 'appointment.status_update':
      return 'Your Docly appointment status has changed';
        case 'doctor.approved':
      return 'Your Docly doctor account has been approved';
    case 'doctor.removed':
      return 'Your Docly doctor profile has been removed';
    default:
      return 'Docly notification';
  }
}