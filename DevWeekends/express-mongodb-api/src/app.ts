const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle invalid JSON bodies before they reach routes.
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON body',
    });
  }
  next(err);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));

// 404 handler for unknown routes
app.use(require('./middleware/error').notFound);

// Centralized error handler (must be the last middleware)
const { errorHandler } = require('./middleware/error');
app.use(errorHandler);

module.exports = app;
