const express = require('express');
const {
  registerUser,
  authUser,
  googleLogin,
  requestOtp,
  verifyPhoneOtp,
  logoutUser,
  getProfile,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/google', googleLogin);
router.post('/phone/request-otp', requestOtp);
router.post('/phone/verify-otp', verifyPhoneOtp);
router.post('/logout', logoutUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
