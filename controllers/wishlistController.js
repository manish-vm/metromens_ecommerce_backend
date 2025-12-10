const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');

// GET /api/wishlist
// Returns an array of populated Product documents
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json(user.wishlist || []);
});

// POST /api/wishlist  { productId }
// Adds product to wishlist (no duplicates) and returns updated wishlist
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('productId is required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!user.wishlist) user.wishlist = [];

  const alreadyThere = user.wishlist.some(
    (id) => id.toString() === productId
  );

  if (!alreadyThere) {
    user.wishlist.push(productId);
  }

  await user.save();

  const updated = await User.findById(req.user._id).populate('wishlist');
  res.json(updated.wishlist || []);
});

// DELETE /api/wishlist/:productId
// Removes a product from the wishlist and returns updated wishlist
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.wishlist = (user.wishlist || []).filter(
    (id) => id.toString() !== productId
  );

  await user.save();

  const updated = await User.findById(req.user._id).populate('wishlist');
  res.json(updated.wishlist || []);
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
