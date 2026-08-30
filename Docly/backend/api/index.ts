/**
 * Vercel serverless entry point.
 *
 * Vercel invokes this exported handler for every /api/* request (rewritten by
 * vercel.json). The Express app itself handles routing — no app.listen() here,
 * because Vercel manages the port in its serverless runtime.
 */
import { createApp } from '../src/app';
import { connectDB } from '../src/config/db';

declare global {
  // When a lambda instance is reused (warm start) we skip reconnecting.
  var __doclyDbConnected: boolean | undefined;
}

const app = createApp();

export default async function handler(req: any, res: any) {
  // Ensure MongoDB is initialized before handling the request. connectDB() is
  // idempotent (it no-ops when the connection is already live), so the global
  // flag here is only a fast-path check; the real guard is in db.ts.
  if (globalThis.__doclyDbConnected !== true) {
    const connected = await connectDB();
    if (connected) {
      globalThis.__doclyDbConnected = true;
    }
  }

  return app(req, res);
}
