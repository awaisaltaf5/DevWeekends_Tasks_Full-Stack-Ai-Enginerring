"use strict";
// Vercel Serverless Function Entry Point (api/index.ts)
// ---------------------------------------------------------------
// Express apps implement the (req, res) handler interface natively,
// which is compatible with Vercel's @vercel/node runtime.
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../server");
console.log('✅ Serverless function initialized successfully (direct Express export)');
exports.default = server_1.app;
