// backend/controllers/categoryController.js
const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');

// Default categories if DB is empty
const DEFAULT_CATEGORIES = [
  { name: 'Men', slug: 'men', description: 'Menswear essentials' },
  { name: 'Women', slug: 'women', description: 'Womenswear collection' },
  { name: 'Winterwear', slug: 'winterwear', description: 'Jackets, hoodies and warm layers' },
  { name: 'Shirts', slug: 'shirts', description: 'Casual and formal shirts' },
  { name: 'Oversized', slug: 'oversized', description: 'Oversized fits and relaxed styles' },
  { name: 'Printed', slug: 'printed', description: 'Graphic and printed t-shirts' }
];

// GET /api/categories
// If no categories exist, seed defaults and return them
const getCategories = asyncHandler(async (req, res) => {
  let categories = await Category.find();

  if (!categories || categories.length === 0) {
    categories = await Category.insertMany(DEFAULT_CATEGORIES);
  }

  res.json(categories);
});

// POST /api/categories
const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
});

// PUT /api/categories/:id
const updateCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) {
    res.status(404);
    throw new Error('Category not found');
  }
  Object.assign(cat, req.body);
  const updated = await cat.save();
  res.json(updated);
});

// DELETE /api/categories/:id
const deleteCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) {
    res.status(404);
    throw new Error('Category not found');
  }
  await cat.deleteOne();
  res.json({ message: 'Category removed' });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
