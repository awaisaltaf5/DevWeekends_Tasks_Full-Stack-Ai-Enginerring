"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = exports.validateTaskId = exports.validateTaskUpdate = exports.validateTaskCreation = void 0;
const express_validator_1 = require("express-validator");
const validateTaskCreation = [
    (0, express_validator_1.body)('title')
        .trim()
        .notEmpty()
        .withMessage('Task title is required')
        .isLength({ max: 100 })
        .withMessage('Task title must be less than 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Task description must be less than 500 characters'),
    (0, express_validator_1.body)('completed')
        .optional()
        .isBoolean()
        .withMessage('Completed must be a boolean value')
];
exports.validateTaskCreation = validateTaskCreation;
const validateTaskUpdate = [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Invalid task ID format'),
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Task title cannot be empty')
        .isLength({ max: 100 })
        .withMessage('Task title must be less than 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Task description must be less than 500 characters'),
    (0, express_validator_1.body)('completed')
        .optional()
        .isBoolean()
        .withMessage('Completed must be a boolean value')
];
exports.validateTaskUpdate = validateTaskUpdate;
const validateTaskId = [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Invalid task ID format')
];
exports.validateTaskId = validateTaskId;
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
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
exports.handleValidationErrors = handleValidationErrors;
