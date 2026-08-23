import { body, param, validationResult } from 'express-validator';
import type { RequestHandler } from 'express';

const validateTaskCreation: RequestHandler[] = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 100 })
    .withMessage('Task title must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Task description must be less than 500 characters'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean value')
];

const validateTaskUpdate: RequestHandler[] = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Task title must be less than 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Task description must be less than 500 characters'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed must be a boolean value')
];

const validateTaskId: RequestHandler[] = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format')
];

const handleValidationErrors: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Use Set to remove duplicate messages
    const uniqueErrors = [...new Set(errors.array().map(err => err.msg))];
    return res.status(400).json({
      success: false,
      message: uniqueErrors.join(', ')
    });
  }
  
  next();
};

export {
  validateTaskCreation,
  validateTaskUpdate,
  validateTaskId,
  handleValidationErrors
};