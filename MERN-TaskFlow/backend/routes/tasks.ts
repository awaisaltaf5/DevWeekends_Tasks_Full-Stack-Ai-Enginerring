const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const {
  validateTaskCreation,
  validateTaskUpdate,
  validateTaskId,
  handleValidationErrors
} = require('../middleware/validation');

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

module.exports = router;