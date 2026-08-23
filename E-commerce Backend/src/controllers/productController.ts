const mongoose = require('mongoose');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/error');
const AppError = require('../utils/AppError');

// @desc    Get all ACTIVE products (public)
// @route   GET /api/products
const getProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get a single product by ID (public)
// @route   GET /api/products/:id
const getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid product ID format');
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Create a new product (admin only)
// @route   POST /api/products
// @access  Private (protect + admin)
const createProduct = asyncHandler(async (req, res, next) => {
  const { name, description, price, category, image, stock, isActive } = req.body;

  // Validate required fields / values.
  if (!name || name.trim() === '') {
    throw new AppError(400, 'Product name is required');
  }
  if (!description || description.trim() === '') {
    throw new AppError(400, 'Product description is required');
  }
  if (price === undefined || price === null) {
    throw new AppError(400, 'Product price is required');
  }
  if (typeof price !== 'number' || Number.isNaN(price)) {
    throw new AppError(400, 'Invalid price');
  }
  if (price < 0) {
    throw new AppError(400, 'Price must be at least 0');
  }
  if (!category || category.trim() === '') {
    throw new AppError(400, 'Product category is required');
  }
  if (stock !== undefined && stock !== null) {
    if (typeof stock !== 'number' || Number.isNaN(stock)) {
      throw new AppError(400, 'Invalid stock');
    }
    if (stock < 0) {
      throw new AppError(400, 'Stock must be at least 0');
    }
  }

  const productData = {
    name: name.trim(),
    description: description.trim(),
    price,
    category: category.trim(),
  };
  if (image !== undefined) productData.image = image;
  if (stock !== undefined && stock !== null) productData.stock = stock;
  if (isActive !== undefined) productData.isActive = isActive;

  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
});

// @desc    Update a product by ID (admin only)
// @route   PUT /api/products/:id
// @access  Private (protect + admin)
const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid product ID format');
  }

  // Re-validate any fields that are being updated.
  const { name, description, price, category, image, stock, isActive } = req.body;

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    throw new AppError(400, 'Product name cannot be empty');
  }
  if (description !== undefined && (typeof description !== 'string' || description.trim() === '')) {
    throw new AppError(400, 'Product description cannot be empty');
  }
  if (price !== undefined && (typeof price !== 'number' || Number.isNaN(price) || price < 0)) {
    throw new AppError(400, 'Invalid price');
  }
  if (category !== undefined && (typeof category !== 'string' || category.trim() === '')) {
    throw new AppError(400, 'Product category is required');
  }
  if (stock !== undefined && (typeof stock !== 'number' || Number.isNaN(stock) || stock < 0)) {
    throw new AppError(400, 'Invalid stock');
  }

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (description !== undefined) updates.description = description.trim();
  if (price !== undefined) updates.price = price;
  if (category !== undefined) updates.category = category.trim();
  if (image !== undefined) updates.image = image;
  if (stock !== undefined) updates.stock = stock;
  if (isActive !== undefined) updates.isActive = isActive;

    const product = await Product.findByIdAndUpdate(id, updates, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product,
  });
});

// @desc    Delete a product by ID (admin only)
// @route   DELETE /api/products/:id
// @access  Private (protect + admin)
const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid product ID format');
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new AppError(404, 'Product not found');
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
