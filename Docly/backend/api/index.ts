/**
 * Vercel serverless entry point.
 *
 * Vercel invokes this exported handler for every /api/* request (rewritten by
 * vercel.json). The Express app itself handles routing — no app.listen() here,
 * because Vercel manages the port in its serverless runtime.
 */
import { createApp } from '../src/app';

const app = createApp();

export default app;
