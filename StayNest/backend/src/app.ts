const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables from .env (git-ignored, never hardcoded).
dotenv.config();

const app = express();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Guard against malformed JSON bodies before they reach the routes.
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON body',
    });
  }
  next(err);
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StayNest API is running',
  });
});

// ---------------------------------------------------------------------------
// Feature routes
// ---------------------------------------------------------------------------
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/hotels', require('./routes/hotelRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/saved', require('./routes/savedRoutes'));
app.use('/api/location', require('./routes/locationRoutes'));

// ---------------------------------------------------------------------------
// 404 handler for unknown routes (mounted AFTER all known routes).
// ---------------------------------------------------------------------------
const { notFound, errorHandler } = require('./middleware/error');
app.use(notFound);

// ---------------------------------------------------------------------------
// Centralized error handler (must be the LAST middleware).
// ---------------------------------------------------------------------------
app.use(errorHandler);

module.exports = app;
