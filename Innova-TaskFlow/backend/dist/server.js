"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const auth_1 = __importDefault(require("./routes/auth"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
console.log('=== Server.ts starting ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);
const app = (0, express_1.default)();
exports.app = app;
// Connect to MongoDB - NON-BLOCKING for Vercel
// In serverless, we connect lazily to avoid timeout during cold start
let dbConnected = false;
const connectToDB = async () => {
    if (dbConnected)
        return true;
    try {
        const connected = await (0, db_1.default)();
        if (connected) {
            dbConnected = true;
            console.log('✅ MongoDB connected successfully');
        }
        else {
            console.error('❌ MongoDB connection failed (but app continues)');
        }
        return Boolean(connected);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown database error';
        console.error('❌ MongoDB connection error:', message);
        // Don't throw - allow the app to continue for health checks
        return false;
    }
};
// Connect immediately (non-blocking - fire and forget)
connectToDB();
// Middleware - simplified CORS for production
const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000']
    : ['http://localhost:5173', 'http://localhost:3000'];
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        // In production on Vercel, be more permissive or use specific origins
        if (process.env.NODE_ENV === 'production') {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Ensure DB connection before API requests (handles serverless cold-start race)
// On cold start, connectToDB() was called fire-and-forget; this middleware
// waits for that connection (or starts one) before the route handler runs.
app.use('/api', async (_req, _res, next) => {
    if (!dbConnected) {
        const connected = await connectToDB();
        if (connected)
            dbConnected = true;
    }
    next();
});
// Routes - lazy load to speed up cold starts
app.use('/api/auth', auth_1.default);
app.use('/api/tasks', tasks_1.default);
// Health check endpoint - responds IMMEDIATELY (never waits for DB)
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        success: true,
        status: 'OK',
        message: 'Server is running',
        mongodb: dbConnected ? 'connected' : 'connecting...',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});
// Base route
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Innova-TaskFlow API',
        version: '1.0.0',
        status: 'Server is running'
    });
});
// 404 handler for unknown routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 5000;
// Only start HTTP server for local development
// In Vercel serverless (api/index.ts requires this file),
// the Express app is exported directly as the handler
if (!process.env.VERCEL) {
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    exports.app = app;
    exports.server = server;
}
else {
    console.log('✅ Running in serverless mode (no app.listen) - exported app for Vercel');
    exports.app = app;
}
