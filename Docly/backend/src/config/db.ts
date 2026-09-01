import mongoose from 'mongoose';
import { env, hasMongoUri } from './env';

/**
 * Connect to MongoDB Atlas via Mongoose.
 *
 * The connection string is read from `process.env.MONGODB_URI` so no Atlas
 * credentials are ever hardcoded.
 *
 * - A short `serverSelectionTimeoutMS` fails fast on an unreachable cluster
 *   rather than hanging the process.
 * - On serverless (Vercel) the handler in `api/index.ts` guards requests and
 *   returns a clear 503 when the DB is down instead of leaking Mongoose
 *   connection errors to clients.
 *
 * Returns `true` when the connection was established, otherwise `false`. The
 * process keeps running so the `/api/health` smoke endpoint stays reachable
 * while the DB is being wired up, but DB-backed calls will return 503 until
 * Mongo is reachable.
 */
// Latest connection attempt error. Exposed via /api/health so a "disconnected"
// database can be diagnosed from the deployed response instead of needing raw
// function logs. On serverless (Vercel) each lambda handles its own state, so
// this is per-instance only — which is exactly what the health call observes.
let lastDbErrorMessage: string | undefined;

/** Return the message of the most recent failed `connectDB()` attempt, if any. */
export function getDbError(): string | undefined {
  return lastDbErrorMessage;
}

export async function connectDB(): Promise<boolean> {
  const configured = hasMongoUri();
  if (!configured) {
    lastDbErrorMessage = 'MONGODB_URI is not set';
    console.log('[Docly] MONGODB_URI is not set. Skipping database connection (health endpoint still available).');
    console.log('[Docly] Add your Atlas connection string to backend/.env as MONGODB_URI to enable the database.');
    return false;
  }

  // If already connected, avoid reconnecting on every warm request.
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    // Connect with a short timeout so Vercel cold-starts fail fast instead of
    // hanging until the platform 504s. Commands are allowed to buffer while
    // the connection is being established; we only surface the failure clearly
    // via the /api/health endpoint and the serverless handler below.
    const uri = env.mongoUri;
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 9000,
    });
    lastDbErrorMessage = undefined;
    console.log(`MongoDB Connected: ${connection.connection.host}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    lastDbErrorMessage = message;
    console.error(`Error connecting to MongoDB: ${message}`);
    console.log('[Docly] The health endpoint stays available while you fix MONGODB_URI.');
    console.log('[Docly] NOTE: DB-backed endpoints (doctors, auth, etc.) will return errors until Mongo is reachable.');
    return false;
  }
}