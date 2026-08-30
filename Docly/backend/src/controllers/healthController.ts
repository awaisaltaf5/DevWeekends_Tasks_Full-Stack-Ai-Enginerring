import { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/apiResponse';
import { hasMongoUri } from '../config/env';
import { getDbError } from '../config/db';

/**
 * GET /api/health — lightweight smoke endpoint.
 * Reports whether MongoDB is actually connected (not just configured).
 */
export const health = (_req: Request, res: Response): Response => {
  const configured = hasMongoUri();

  // Report the real Mongoose connection state so a "configured but not
  // connected" database is surfaced instead of silently passing health.
  let dbState: 'not-configured' | 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'unknown' = 'unknown';
  switch (mongoose.connection.readyState) {
    case 0:
      dbState = configured ? 'disconnected' : 'not-configured';
      break;
    case 1:
      dbState = 'connected';
      break;
    case 2:
      dbState = 'connecting';
      break;
    case 3:
      dbState = 'disconnecting';
      break;
    default:
      dbState = 'unknown';
  }

  return sendSuccess(res, 200, 'Docly API is running', {
    status: 'ok',
    database: dbState,
    dbConfigured: configured,
    dbError: dbState !== 'connected' ? (getDbError() ?? null) : null,
    timestamp: new Date().toISOString(),
  });
};