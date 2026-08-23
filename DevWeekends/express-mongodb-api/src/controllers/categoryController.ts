const Category = require('../models/Category');
const mongoose = require('mongoose');
const { asyncHandler } = require('../middleware/error');

// @desc    Create a new category for the authenticated user
// @route   POST /api/categories
// @access  Private
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim() === '') {
    throw { statusCode: 400, message: 'Name is required' };
  }

  const category = await Category.create({
    name: name.trim(),
    description: description || '',
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

// @desc    Get all categories for the authenticated user
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// @desc    Get a single category by ID (must belong to the authenticated user)
// @route   GET /api/categories/:id
// @access  Private
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { statusCode: 400, message: 'Invalid category ID format' };
  }

  const category = await Category.findById(id);

  if (!category) {
    throw { statusCode: 404, message: 'Category not found' };
  }

  if (String(category.user) !== String(req.user._id)) {
    throw { statusCode: 403, message: 'Not authorized to access this category' };
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Update a category by ID (must belong to the authenticated user)
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { statusCode: 400, message: 'Invalid category ID format' };
  }

  if (name !== undefined && name.trim() === '') {
    throw { statusCode: 400, message: 'Name cannot be empty' };
  }

  const category = await Category.findById(id);

  if (!category) {
    throw { statusCode: 404, message: 'Category not found' };
  }

  if (String(category.user) !== String(req.user._id)) {
    throw { statusCode: 403, message: 'Not authorized to access this category' };
  }

  if (name !== undefined) category.name = name.trim();
  if (description !== undefined) category.description = description;

  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
});

// @desc    Delete a category by ID (must belong to the authenticated user)
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw { statusCode: 400, message: 'Invalid category ID format' };
  }

  const category = await Category.findById(id);

  if (!category) {
    throw { statusCode: 404, message: 'Category not found' };
  }

  if (String(category.user) !== String(req.user._id)) {
    throw { statusCode: 403, message: 'Not authorized to access this category' };
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
