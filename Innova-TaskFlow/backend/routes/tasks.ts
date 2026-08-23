import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController';
import {
  validateTaskCreation,
  validateTaskUpdate,
  validateTaskId,
  handleValidationErrors
} from '../middleware/validation';

const router = express.Router();

// GET /api/tasks - Get all tasks
router.get('/', getTasks);

// POST /api/tasks - Create a new task
router.post('/', validateTaskCreation, handleValidationErrors, createTask);

// GET /api/tasks/:id - Get single task
router.get('/:id', validateTaskId, handleValidationErrors, getTask);

// PUT /api/tasks/:id - Update task
router.put('/:id', validateTaskUpdate, handleValidationErrors, updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', validateTaskId, handleValidationErrors, deleteTask);

export default router;