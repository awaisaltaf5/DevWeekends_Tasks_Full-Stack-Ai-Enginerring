// Vercel Serverless Function Entry Point (api/index.ts)
// ---------------------------------------------------------------
// Express apps implement the (req, res) handler interface natively,
// which is compatible with Vercel's @vercel/node runtime.

import { app } from '../server';

console.log('✅ Serverless function initialized successfully (direct Express export)');

export default app;