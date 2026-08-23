const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// All category routes require a valid JWT.
router.use(protect);

router.route('/').post(createCategory).get(getCategories);
router.route('/:id').get(getCategoryById).put(updateCategory).delete(deleteCategory);

module.exports = router;
