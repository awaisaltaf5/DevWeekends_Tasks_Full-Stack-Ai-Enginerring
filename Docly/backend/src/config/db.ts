import mongoose from 'mongoose';
import { env, hasMongoUri } from './env';

/**
 * Connect to MongoDB Atlas via Mongoose.
 *
 * The connection string is read from `process.env.MONGODB_URI` so no Atlas
 * credentials are ever hardcoded.
 *
 * - `bufferCommands = false` makes any DB query fail immediately (with a clear
 *   error) instead of buffering for 10s when Mongo is unreachable. Buffering
 *   caused DB-backed endpoints to hang and surface as `502 Bad Gateway`
 *   through the Vite dev proxy.
 * - A short `serverSelectionTimeoutMS` fails fast on an unreachable cluster
 *   rather than hanging the process.
 *
 * Returns `true` when the connection was established, otherwise `false`. The
 * process keeps running so the `/api/health` smoke endpoint stays reachable
 * while the DB is being wired up, but DB-backed calls will now fail with a
 * clear error instead of silently hanging.
 */
export async function connectDB(): Promise<boolean> {
  const configured = hasMongoUri();
  if (!configured) {
    console.log('[Docly] MONGODB_URI is not set. Skipping database connection (health endpoint still available).');
    console.log('[Docly] Add your Atlas connection string to backend/.env as MONGODB_URI to enable the database.');
    return false;
  }
  try {
    // Do not silently buffer DB commands when disconnected — fail fast so the
    // failure is visible and debuggable instead of a 10-second hang -> 502.
    mongoose.set('bufferCommands', false);

    const uri = env.mongoUri;
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`MongoDB Connected: ${connection.connection.host}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error connecting to MongoDB: ${message}`);
    console.log('[Docly] The health endpoint stays available while you fix MONGODB_URI.');
    console.log('[Docly] NOTE: DB-backed endpoints (doctors, auth, etc.) will return errors until Mongo is reachable.');
    return false;
  }
}