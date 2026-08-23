const Task = require('../models/Task');
const mongoose = require('mongoose');
const { asyncHandler } = require('../middleware/error');

// @desc    Create a new task for the authenticated user
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, completed } = req.body;

  if (!title || title.trim() === '') {
    throw { statusCode: 400, message: 'Title is required' };
  }

  const task = await Task.create({
    title: title.trim(),
    description: description || '',
    completed: completed || false,
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
});

// @desc    Get all tasks for the authenticated user
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

// @desc    Get a single task by ID (must belong to the authenticated user)
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { statusCode: 400, message: 'Invalid task ID format' };
  }

  const task = await Task.findById(id);

  if (!task) {
    throw { statusCode: 404, message: 'Task not found' };
  }

  if (String(task.user) !== String(req.user._id)) {
    throw { statusCode: 403, message: 'Not authorized to access this task' };
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

// @desc    Update a task by ID (must belong to the authenticated user)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { statusCode: 400, message: 'Invalid task ID format' };
  }

  if (title !== undefined && title.trim() === '') {
    throw { statusCode: 400, message: 'Title cannot be empty' };
  }

  const task = await Task.findById(id);

  if (!task) {
    throw { statusCode: 404, message: 'Task not found' };
  }

  if (String(task.user) !== String(req.user._id)) {
    throw { statusCode: 403, message: 'Not authorized to access this task' };
  }

  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description;
  if (completed !== undefined) task.completed = completed;

  await task.save();

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
});

// @desc    Delete a task by ID (must belong to the authenticated user)
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { statusCode: 400, message: 'Invalid task ID format' };
  }

  const task = await Task.findById(id);

  if (!task) {
    throw { statusCode: 404, message: 'Task not found' };
  }

  if (String(task.user) !== String(req.user._id)) {
    throw { statusCode: 403, message: 'Not authorized to access this task' };
  }

  await task.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};