"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTask = exports.getTasks = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const getErrorMessage = (error) => error instanceof Error ? error.message : 'Unknown error';
const isMongooseValidationError = (error) => typeof error === 'object' && error !== null && 'name' in error && error.name === 'ValidationError' && 'errors' in error;
// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
const getTasks = async (_req, res) => {
    try {
        const tasks = await Task_1.default.find({}).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: getErrorMessage(error)
        });
    }
};
exports.getTasks = getTasks;
// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Public
const getTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task_1.default.findById(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        res.status(200).json({
            success: true,
            data: task
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task',
            error: getErrorMessage(error)
        });
    }
};
exports.getTask = getTask;
// @desc    Create task
// @route   POST /api/tasks
// @access  Public
const createTask = async (req, res) => {
    try {
        const { title, description, completed } = req.body;
        // Validation
        if (typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Task title is required'
            });
        }
        if (typeof title === 'string' && title.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Task title must be less than 100 characters'
            });
        }
        if (typeof description === 'string' && description.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Task description must be less than 500 characters'
            });
        }
        // Create task
        const task = await Task_1.default.create({
            title: title.trim(),
            description: typeof description === 'string' ? description.trim() : '',
            completed: completed === true
        });
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task
        });
    }
    catch (error) {
        if (isMongooseValidationError(error)) {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create task',
            error: getErrorMessage(error)
        });
    }
};
exports.createTask = createTask;
// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Public
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, completed } = req.body;
        // Find and update task
        const task = await Task_1.default.findByIdAndUpdate(id, {
            ...(typeof title === 'string' && { title: title.trim() }),
            ...(typeof description === 'string' && { description: description.trim() }),
            ...(completed !== undefined && { completed })
        }, {
            new: true,
            runValidators: true
        });
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: task
        });
    }
    catch (error) {
        if (isMongooseValidationError(error)) {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update task',
            error: getErrorMessage(error)
        });
    }
};
exports.updateTask = updateTask;
// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Public
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task_1.default.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete task',
            error: getErrorMessage(error)
        });
    }
};
exports.deleteTask = deleteTask;
