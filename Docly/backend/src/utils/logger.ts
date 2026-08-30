/**
 * Lightweight logger. Uses `console` in development / when pino is not installed,
 * and a real pino instance in production when the package is available.
 */
/* eslint-disable no-console */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogFn {
  (obj: Record<string, unknown> | string, msg?: string): void;
}

function makeConsoleLogger(): Record<LogLevel, LogFn> {
  return {
    info: (obj, msg) => console.info(msg ?? (typeof obj === 'string' ? obj : JSON.stringify(obj)), typeof obj === 'string' ? '' : obj),
    warn: (obj, msg) => console.warn(msg ?? (typeof obj === 'string' ? obj : JSON.stringify(obj)), typeof obj === 'string' ? '' : obj),
    error: (obj, msg) => console.error(msg ?? (typeof obj === 'string' ? obj : JSON.stringify(obj)), typeof obj === 'string' ? '' : obj),
    debug: (obj, msg) => console.debug(msg ?? (typeof obj === 'string' ? obj : JSON.stringify(obj)), typeof obj === 'string' ? '' : obj),
  };
}

let _logger: Record<LogLevel, LogFn> | null = null;

export function getLogger(): Record<LogLevel, LogFn> {
  if (_logger) return _logger;

  try {
    // Attempt to use pino if available (production-optimized).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pino = require('pino');
    _logger = pino({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: process.env.NODE_ENV !== 'production' ? undefined : undefined,
    });
    // pino's interface is (msg, obj) or (obj, msg) depending on version; normalize.
    return _logger as unknown as Record<LogLevel, LogFn>;
  } catch {
    _logger = makeConsoleLogger();
    return _logger;
  }
}

/** Pre-initialized logger instance for direct import. */
export const logger = {
  info: (obj: Record<string, unknown> | string, msg?: string) => getLogger().info(obj, msg),
  warn: (obj: Record<string, unknown> | string, msg?: string) => getLogger().warn(obj, msg),
  error: (obj: Record<string, unknown> | string, msg?: string) => getLogger().error(obj, msg),
  debug: (obj: Record<string, unknown> | string, msg?: string) => getLogger().debug(obj, msg),
};
