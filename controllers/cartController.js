const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product'
  );
  res.json(cart || { user: req.user._id, items: [] });
});

// POST /api/cart  (add to cart)
const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty, size, color } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    (i) =>
      i.product.toString() === productId &&
      i.size === size &&
      i.color === color
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].qty += qty;
  } else {
    cart.items.push({ product: productId, qty, size, color });
  }

  await cart.save();

  // ✅ Return populated cart so frontend has full product info
  const populated = await Cart.findOne({ user: req.user._id }).populate(
    'items.product'
  );
  res.json(populated);
});

// PUT /api/cart  (update qty for one item)
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, size, color, qty } = req.body;
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  const item = cart.items.find(
    (i) =>
      i.product.toString() === productId &&
      i.size === size &&
      i.color === color
  );

  if (!item) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  // If qty <= 0, remove the item instead of keeping invalid qty
  if (qty <= 0) {
    cart.items = cart.items.filter(
      (i) =>
        !(
          i.product.toString() === productId &&
          i.size === size &&
          i.color === color
        )
    );
  } else {
    item.qty = qty;
  }

  await cart.save();

  const populated = await Cart.findOne({ user: userId }).populate(
    'items.product'
  );
  res.json(populated);
});

// DELETE /api/cart  (remove single item)
const removeFromCart = asyncHandler(async (req, res) => {
  // Expecting productId, size, color in body (from axios delete data)
  const { productId, size, color } = req.body;
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  cart.items = cart.items.filter(
    (i) =>
      !(
        i.product.toString() === productId &&
        i.size === size &&
        i.color === color
      )
  );

  await cart.save();

  const populated = await Cart.findOne({ user: userId }).populate(
    'items.product'
  );
  res.json(populated);
});

// Optional: clear whole cart (not currently used by routes)
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ message: 'Cart cleared' });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
