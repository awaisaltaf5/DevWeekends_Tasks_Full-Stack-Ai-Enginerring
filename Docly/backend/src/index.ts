import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  // Connect to MongoDB Atlas. The connection is awaited so the server only
  // reports "running" after the DB is confirmed (or clearly warned as down).
  // When Mongo is unreachable the process still listens for /api/health, but
  // DB-backed calls fail fast (bufferCommands=false) instead of hanging.
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.warn('[Docly] Starting WITHOUT a confirmed MongoDB connection. DB-backed endpoints will error.');
  }

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Docly API running on port ${env.port}`);
    console.log(`Environment: ${env.nodeEnv}`);
    console.log(`Database: ${dbConnected ? 'connected' : 'not connected'}`);
    console.log(`Health check: http://localhost:${env.port}/api/health`);
  });
}

bootstrap().catch((err) => {
  console.error('Docly failed to start:', err);
  process.exit(1);
});