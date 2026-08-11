let app;
let handler;
try {
  const serverless = require('serverless-http');
  const serverModule = require('../server.js');
  app = serverModule.app;
  handler = serverless(app);
} catch (error) {
  console.error('FATAL: Failed to initialize serverless function:', error);
  // Create a minimal fallback so Vercel doesn't crash completely
  try {
    const express = require('express');
    const serverless = require('serverless-http');
    app = express();
    app.get('/api/health', (req, res) => {
      res.status(200).json({ success: true, status: 'OK', fallback: true });
    });
    app.get('*', (req, res) => {
      res.status(500).json({
        success: false,
        message: 'Server failed to initialize',
        error: error.message
      });
    });
    handler = serverless(app);
  } catch (fallbackError) {
    console.error('FATAL: Even fallback failed:', fallbackError);
    // Last resort: return a raw handler
    handler = (req, res) => {
      res.status(500).json({ success: false, message: 'Critical server failure' });
    };
  }
}

module.exports = handler;