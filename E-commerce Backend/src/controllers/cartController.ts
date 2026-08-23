const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/error');
const AppError = require('../utils/AppError');

// Re-fetch the user's cart with product details populated.
const buildCartResponse = async (userId) => {
  return Cart.findOne({ user: userId }).populate('items.product', 'name price image');
};

// @desc    Get the authenticated user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res, next) => {
  const cart = await buildCartResponse(req.user._id);

  if (!cart) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: { user: req.user._id, items: [] },
    });
  }

  res.status(200).json({
    success: true,
    count: cart.items.length,
    data: cart,
  });
});

// @desc    Add a product to the cart (creates the cart if none exists).
//          Existing cart items are quantity-merged.
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError(400, 'Invalid product ID');
  }

  const qty = quantity === undefined || quantity === null ? 1 : quantity;
  if (typeof qty !== 'number' || Number.isNaN(qty) || qty < 1) {
    throw new AppError(400, 'Quantity must be at least 1');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(404, 'Product not found');
  }
  if (!product.isActive) {
    throw new AppError(400, 'Product is not available');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existing = cart.items.find((i) => String(i.product) === String(productId));
  const newQty = (existing ? existing.quantity : 0) + qty;

  if (newQty > product.stock) {
    throw new AppError(400, `Insufficient stock (available: ${product.stock})`);
  }

  if (existing) {
    existing.quantity = newQty;
    existing.price = product.price; // refresh price snapshot
  } else {
    cart.items.push({ product: product._id, quantity: qty, price: product.price });
  }

  await cart.save();

  const data = await buildCartResponse(req.user._id);
  res.status(200).json({
    success: true,
    message: 'Product added to cart',
    data,
  });
});

// @desc    Update the quantity of a product already in the cart
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError(400, 'Invalid product ID');
  }
  if (quantity === undefined || typeof quantity !== 'number' || Number.isNaN(quantity) || quantity < 1) {
    throw new AppError(400, 'Quantity must be at least 1');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new AppError(404, 'Cart not found');
  }

  const item = cart.items.find((i) => String(i.product) === String(productId));
  if (!item) {
    throw new AppError(404, 'Product not in cart');
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new AppError(400, 'Product is not available');
  }
  if (quantity > product.stock) {
    throw new AppError(400, `Insufficient stock (available: ${product.stock})`);
  }

  item.quantity = quantity;
  await cart.save();

  const data = await buildCartResponse(req.user._id);
  res.status(200).json({
    success: true,
    message: 'Cart item updated',
    data,
  });
});

// @desc    Remove a single product from the cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError(400, 'Invalid product ID');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new AppError(404, 'Cart not found');
  }

  const before = cart.items.length;
  cart.items = cart.items.filter((i) => String(i.product) !== String(productId));
  if (cart.items.length === before) {
    throw new AppError(404, 'Product not in cart');
  }

  await cart.save();

  const data = await buildCartResponse(req.user._id);
  res.status(200).json({
    success: true,
    message: 'Product removed from cart',
    data,
  });
});

// @desc    Clear the entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    return res.status(200).json({
      success: true,
      message: 'Cart is already empty',
      count: 0,
      data: { user: req.user._id, items: [] },
    });
  }

  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Cart cleared',
    count: 0,
    data: cart,
  });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
