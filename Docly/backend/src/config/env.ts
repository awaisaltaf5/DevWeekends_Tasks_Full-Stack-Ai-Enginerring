import dotenv from 'dotenv';

// Load `.env` from the backend working directory. When running via
// `npm run dev` (cwd = backend), this loads backend/.env.
dotenv.config();

function read(name: string): string | undefined {
  return process.env[name];
}

function readWithDefault(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

/** Named set of validated environment variables used across the process. */
export const env = {
  port: Number(readWithDefault('PORT', '5000')),
  nodeEnv: readWithDefault('NODE_ENV', 'development'),
  mongoUri: read('MONGODB_URI') ?? '',
  jwtSecret: read('JWT_SECRET') ?? '',
  jwtExpiresIn: readWithDefault('JWT_EXPIRES_IN', '7d'),
  clientOrigins: read('CLIENT_ORIGIN') ?? '',
  googleClientId: read('GOOGLE_CLIENT_ID') ?? '',
    adminNameForSeed: read('ADMIN_NAME') ?? '',
  adminEmailForSeed: read('ADMIN_EMAIL') ?? '',
  adminPasswordForSeed: read('ADMIN_PASSWORD') ?? '',
  // Jitsi / video consultation
  jitsiAppId: read('JITSI_APP_ID') ?? '',
  jitsiAppSecret: read('JITSI_APP_SECRET') ?? '',
  jitsiDomain: readWithDefault('JITSI_DOMAIN', '8x8.vc'),
  // Email notifications: Brevo SMTP is preferred, Resend remains supported.
  smtpHost: readWithDefault('SMTP_HOST', ''),
  smtpPort: Number(readWithDefault('SMTP_PORT', '587')),
  smtpUser: read('SMTP_USER') ?? '',
  smtpPass: read('SMTP_PASS') ?? '',
  resendApiKey: read('RESEND_API_KEY') ?? '',
  // Email "from" address for Resend (must be a verified domain/sender).
  emailFrom: readWithDefault('EMAIL_FROM', 'no-reply@docly.com'),
  // Base URL of the frontend, used to build meeting links in emails.
  clientUrl: read('CLIENT_URL') ?? read('CLIENT_ORIGIN') ?? 'http://localhost:3000',
};

/** True when a real (non-empty) MongoDB URI has been configured. */
export function hasMongoUri(): boolean {
  return env.mongoUri.length > 0;
}