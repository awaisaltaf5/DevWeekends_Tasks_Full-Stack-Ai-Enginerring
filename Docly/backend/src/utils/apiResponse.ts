import { type Response } from 'express';

/**
 * Consistent success envelope.
 *
 *   sendSuccess(res, 201, 'User registered', { token, user })
 *   -> { success: true, message, token, user }
 *
 * The `data` payload is spread onto the response body alongside the envelope.
 */
export function sendSuccess(
  res: Response,
  statusCode: number,
  message: string,
  data?: Record<string, unknown>,
): Response {
  const body: Record<string, unknown> = { success: true, message };
  if (data) {
    for (const [key, value] of Object.entries(data)) {
      body[key] = value;
    }
  }
  return res.status(statusCode).json(body);
}

/**
 * Consistent error envelope used by routes that short-circuit without relying
 * on the global error handler (e.g. validation helpers).
 */
export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  details?: Record<string, unknown>,
): Response {
  const body: Record<string, unknown> = { success: false, message };
  if (details) {
    body.details = details;
  }
  return res.status(statusCode).json(body);
}