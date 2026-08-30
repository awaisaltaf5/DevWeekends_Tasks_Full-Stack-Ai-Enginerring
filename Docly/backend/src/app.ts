import express, { type Express } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { env } from './config/env';

const corsOrigins = env.clientOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

/**
 * Build and configure the Express application.
 *
 * Security / production middleware:
 *  - express.json() with a body-size cap.
 *  - cors() restricted to CLIENT_ORIGIN when provided.
 *  - trust proxy disabled by default (safe for direct hosting).
 *  - Centralized 404 + error handlers mounted last.
 */
export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');

  app.use(express.json({ limit: '1mb' }));

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        const isLocalDevelopmentOrigin =
          env.nodeEnv === 'development' &&
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        callback(null, isLocalDevelopmentOrigin);
      },
      credentials: true,
    }),
  );

  // Simple request logger in development.
  if (env.nodeEnv === 'development') {
    app.use((req, _res, next) => {
      console.log(`${req.method} ${req.originalUrl}`);
      next();
    });
  }

  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Docly API is running',
      status: 'ok',
      routes: ['/api/health', '/api/auth', '/api/doctors', '/api/appointments'],
    });
  });

  app.get('/api', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Docly API root',
      status: 'ok',
      routes: ['/api/health', '/api/auth', '/api/doctors', '/api/appointments'],
    });
  });

  app.get('/api/', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Docly API root',
      status: 'ok',
      routes: ['/api/health', '/api/auth', '/api/doctors', '/api/appointments'],
    });
  });

  app.use('/api', routes);

  // 404 for unknown routes, then the centralized error handler.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp();