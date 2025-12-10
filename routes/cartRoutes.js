const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getCart);       // GET /api/cart
router.post('/', protect, addToCart);    // POST /api/cart
router.put('/', protect, updateCartItem); // PUT /api/cart
router.delete('/', protect, removeFromCart); // DELETE /api/cart

module.exports = router;
