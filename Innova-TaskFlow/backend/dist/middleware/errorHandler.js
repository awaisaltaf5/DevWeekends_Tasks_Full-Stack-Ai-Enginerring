"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors ?? {}).map(val => val.message);
        return res.status(400).json({
            success: false,
            message: messages.join(', ')
        });
    }
    // Mongoose cast error (invalid ID)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }
    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue ?? {})[0] ?? 'Field';
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }
    // Default error
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
