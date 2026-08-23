import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import cors, { type CorsOptions } from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

console.log('=== Server.ts starting ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);

const app = express();

// Connect to MongoDB - NON-BLOCKING for Vercel
// In serverless, we connect lazily to avoid timeout during cold start
let dbConnected = false;

const connectToDB = async (): Promise<boolean> => {
  if (dbConnected) return true;
  
  try {
    const connected = await connectDB();
    if (connected) {
      dbConnected = true;
      console.log('✅ MongoDB connected successfully');
    } else {
      console.error('❌ MongoDB connection failed (but app continues)');
    }
    return Boolean(connected);
  } catch (error: unknown) {
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

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In production on Vercel, be more permissive or use specific origins
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB connection before API requests (handles serverless cold-start race)
// On cold start, connectToDB() was called fire-and-forget; this middleware
// waits for that connection (or starts one) before the route handler runs.
app.use('/api', async (_req, _res, next) => {
  if (!dbConnected) {
    const connected = await connectToDB();
    if (connected) dbConnected = true;
  }
  next();
});

// Routes - lazy load to speed up cold starts
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint - responds IMMEDIATELY (never waits for DB)
app.get('/api/health', (_req: Request, res: Response) => {
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
app.get('/', (_req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'Welcome to Innova-TaskFlow API',
    version: '1.0.0',
    status: 'Server is running'
  });
});

// 404 handler for unknown routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

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
} else {
  console.log('✅ Running in serverless mode (no app.listen) - exported app for Vercel');
  exports.app = app;
}

export { app };