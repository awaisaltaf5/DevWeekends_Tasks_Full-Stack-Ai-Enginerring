/**
 * Vercel serverless entry point.
 *
 * Vercel invokes this exported handler for every /api/* request (rewritten by
 * vercel.json). The Express app itself handles routing — no app.listen() here,
 * because Vercel manages the port in its serverless runtime.
 */
import { createApp } from '../src/app';
import { connectDB, getDbError } from '../src/config/db';

declare global {
  // When a lambda instance is reused (warm start) we skip reconnecting.
  var __doclyDbConnected: boolean | undefined;
}

const app = createApp();

export default async function handler(req: any, res: any) {
  // Health is a liveness check and must remain available when MongoDB is down.
  // It reports the current connection state without opening a new connection
  // or issuing a database query.
  const requestPath = new URL(req.url ?? '/', 'http://localhost').pathname.replace(/\/+$/, '');
  const isHealthRequest = req.method === 'GET' && requestPath === '/api/health';

  // Ensure MongoDB is initialized before handling the request. connectDB() is
  // idempotent (it no-ops when the connection is already live), so the global
  // flag here is only a fast-path check; the real guard is in db.ts.
  if (!isHealthRequest && globalThis.__doclyDbConnected !== true) {
    const connected = await connectDB();
    if (connected) {
      globalThis.__doclyDbConnected = true;
    } else {
      // Surface a clear error instead of letting unconnected queries crash
      // with Mongoose's "bufferCommands=false" error.
      return res.status(503).json({
        success: false,
        message: 'Database is unavailable. Please try again later.',
        database: 'disconnected',
        dbError: getDbError() ?? 'Connection failed',
      });
    }
  }

  return app(req, res);
}
