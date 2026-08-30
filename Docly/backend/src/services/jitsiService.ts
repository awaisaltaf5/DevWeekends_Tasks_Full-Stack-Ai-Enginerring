import { env } from '../config/env';
import { AppError } from '../utils/AppError';

/**
 * Generate a Jitsi JWT for the Jitsi as a Service (JaaS) / self-hosted
 * token-based authentication.
 *
 * The secret and app-id are read from env only (never hardcoded):
 *   JITSI_APP_ID
 *   JITSI_APP_SECRET
 *
 * See: https://jaas-voip.8x8.com/v1/applications/{APP_ID}/config
 */
export function isJitsiConfigured(): boolean {
  return Boolean(env.jitsiAppId && env.jitsiAppSecret);
}

/** Build a deterministic, unique room name for an appointment. */
export function buildMeetingRoom(appointmentId: string): string {
  return `docly-${appointmentId.slice(-8)}`;
}

/**
 * Create a Jitsi JWT that authenticates a participant as `identity` in a room.
 * `role` is 'host' (doctor) or 'guest' (patient).
 */
export function createJitsiToken(
  roomName: string,
  identity: string,
  role: 'host' | 'guest',
  displayName?: string,
): string {
  if (!isJitsiConfigured()) {
    throw new AppError(
      503,
      'Video consultation is not configured. Add JITSI_APP_ID and JITSI_APP_SECRET to the backend environment.',
    );
  }

  const appId = env.jitsiAppId;
  const secret = env.jitsiAppSecret;
  const exp = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour

  const payload = {
    iss: 'docly',
    aud: 'jitsi',
    sub: appId,
    exp,
    room: roomName,
    context: {
      user: {
        name: displayName ?? identity,
        email: identity,
        avatar: 'https://www.gravatar.com/avatar/',
      },
      features: {
        'outbound-call': true,
        'outbound-pstn': true,
        'inbound-pstn': true,
        'sip-phone': true,
      },
    },
  };

  const roleMap: Record<'host' | 'guest', string> = {
    host: 'moderator',
  guest: 'participant',
  };

  // Jitsi JWT v2 uses the "context" + "room" claim + "role" inside context.
  // We keep the structure compatible with the standard Jitsi JWT format.
  const tokenPayload = {
    iss: appId,
    sub: appId,
    aud: 'jitsi',
    exp,
    room: roomName,
    context: {
      user: {
        name: displayName ?? identity,
        email: identity,
      },
      // role is set per the v2 JWT spec
      ...(role === 'host'
        ? { role: 'moderator', moderator: true }
        : { role: 'participant', moderator: false }),
    },
  };

  let tokenStr: string | undefined;
  try {
    // Lazy-require to keep the import side-effect-free when Jitsi is not used.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { sign }: typeof import('jsonwebtoken') = require('jsonwebtoken');
    tokenStr = sign(tokenPayload, secret, { algorithm: 'HS256' });
  } catch {
    throw new AppError(503, 'Video consultation is not available right now.');
  }

  if (!tokenStr) {
    throw new AppError(503, 'Failed to generate video meeting token.');
  }

  return tokenStr;
}

/**
 * Return the Jitsi config needed by the frontend to join a meeting.
 * The token is only returned (so the patient can join silently / with a name),
 * but the raw APP_SECRET never leaves the server.
 */
export function getJitsiConfig(appointmentId: string, role: 'host' | 'guest', identity: string, displayName?: string) {
  const room = buildMeetingRoom(appointmentId);
  const url = isJitsiConfigured()
    ? `https://${env.jitsiDomain}/${env.jitsiAppId}/${room}`
    : '';
  let token: string | null = null;

  if (isJitsiConfigured()) {
    try {
      token = createJitsiToken(room, identity, role, displayName);
    } catch {
      token = null;
    }
  }

  return {
    room,
    url,
    appId: env.jitsiAppId,
    token,
    displayName: displayName ?? identity,
    isConfigured: isJitsiConfigured(),
  };
}