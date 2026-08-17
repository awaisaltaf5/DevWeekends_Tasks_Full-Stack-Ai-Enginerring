const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/error');
const AppError = require('../utils/AppError');

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// @desc    Create an order from the authenticated user's cart.
// @route   POST /api/orders
// @access  Private
//
// Flow (per spec):
//   1. Auth via protect. 2. Read user's cart. 3. Reject empty cart.
//   4. Verify products still exist + active. 5. Verify stock.
//   6. Calculate total on the SERVER (never trust client). 7. Create order.
//   8. Reduce product stock (atomic per product). 9. Clear cart. 10. Return order.
const createOrder = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart || cart.items.length === 0) {
    throw new AppError(400, 'Your cart is empty');
  }

  const orderItems = [];

  for (const item of cart.items) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new AppError(404, `Product not found: ${item.product}`);
    }
    if (!product.isActive) {
      throw new AppError(400, `Product ${product.name} is no longer available`);
    }
    if (item.quantity > product.stock) {
      throw new AppError(400, `Insufficient stock for ${product.name} (available: ${product.stock})`);
    }

    // Decrement stock atomically (only if enough is still available).
    const decremented = await Product.findOneAndUpdate(
      { _id: product._id, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
      { returnDocument: 'after' }
    );
    if (!decremented) {
      throw new AppError(400, `Insufficient stock for ${product.name}`);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price, // server-sourced price
      quantity: item.quantity,
    });
  }

  // 6. Calculate the total on the SERVER from the (re-fetched) product prices.
  const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // 7. Create the order.
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
    status: 'pending',
  });

  // 9. Clear the cart.
  cart.items = [];
  await cart.save();

  // 10. Return the populated order.
  const populated = await Order.findById(order._id).populate('items.product', 'name price image');

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: populated,
  });
});

// @desc    Get all orders for the authenticated user
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Get a single order (only the owner can access it)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid order ID');
  }

  const order = await Order.findById(id).populate('items.product', 'name price image');

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  // Users can only access their own orders.
  if (String(order.user) !== String(req.user._id)) {
    throw new AppError(403, 'Not authorized to access this order');
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Update an order's status (admin only)
// @route   PUT /api/orders/:id/status
// @access  Private (protect + admin)
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid order ID');
  }
  if (!status) {
    throw new AppError(400, 'Status is required');
  }
  if (!ORDER_STATUSES.includes(status)) {
    throw new AppError(400, `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`);
  }

  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { returnDocument: 'after', runValidators: true }
  );

  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  res.status(200).json({
    success: true,
    message: 'Order status updated',
    data: order,
  });
});

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };
