// Vercel Serverless Function Entry Point (api/index.js)
// ---------------------------------------------------------------
// FIX: Export the Express app DIRECTLY instead of wrapping with
// serverless-http. Express apps implement the (req, res) handler
// interface natively, which is fully compatible with Vercel's
// @vercel/node runtime. The serverless-http wrapper was causing
// responses to hang (status code 9 = 9ms duration, but response
// never properly returned to the browser).

const serverModule = require('../server.js');
const app = serverModule.app;

console.log('✅ Serverless function initialized successfully (direct Express export)');

module.exports = app;