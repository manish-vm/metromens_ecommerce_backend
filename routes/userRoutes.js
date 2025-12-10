const express = require('express');
const {
  // existing handlers: registerUser, authUser, etc.
  getMe,
  updateMe
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// ... existing auth/register/admin routes

// ✅ profile routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
