const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// Public routes — anyone can browse products.
router.get('/', getProducts);
router.get('/:id', getProductById);

// Private + admin-only routes for managing products.
// `protect` runs first (verifies JWT + loads req.user), then `admin` checks
// req.user.role === 'admin' (403 otherwise).
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
