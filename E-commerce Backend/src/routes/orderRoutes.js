const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { createOrder, getOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');

// All order routes require an authenticated user.
router.use(protect);

router.route('/').post(createOrder).get(getOrders);
router.route('/:id').get(getOrderById);
// Admin-only status change. Defined before '/:id' for clarity (distinct path).
router.route('/:id/status').put(admin, updateOrderStatus);

module.exports = router;
