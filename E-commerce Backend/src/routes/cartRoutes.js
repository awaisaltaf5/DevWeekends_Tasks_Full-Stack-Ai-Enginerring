const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');

// All cart routes require an authenticated user.
router.use(protect);

router.route('/').get(getCart).post(addToCart).delete(clearCart);
router.route('/:productId').put(updateCartItem).delete(removeFromCart);

module.exports = router;
