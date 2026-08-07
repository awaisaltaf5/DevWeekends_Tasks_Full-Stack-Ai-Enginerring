const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

// All task routes require a valid JWT.
router.use(protect);

router.route('/').post(createTask).get(getTasks);
router.route('/:id').get(getTaskById).put(updateTask).delete(deleteTask);

module.exports = router;
