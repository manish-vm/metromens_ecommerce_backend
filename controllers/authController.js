const asyncHandler = require('express-async-handler');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { generateOtp, verifyOtp } = require('../utils/sendOtp');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password, phone });
  generateToken(res, user._id, user.isAdmin);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin
  });
});

// Email/password login
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id, user.isAdmin);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// Google login (frontend sends Google ID token)
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      googleId,
      avatar: picture
    });
  }

  generateToken(res, user._id, user.isAdmin);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin
  });
});

// Request OTP for phone login
const requestOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    res.status(400);
    throw new Error('Phone is required');
  }

  const otp = generateOtp(phone);
  // In production, send via SMS gateway.
  res.json({ success: true, message: 'OTP sent', devOtp: otp });
});

// Verify OTP and login
const verifyPhoneOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  if (!verifyOtp(phone, otp)) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({
      name: `User-${phone.slice(-4)}`,
      email: `${phone}@metromenswear-otp.local`,
      phone
    });
  }

  generateToken(res, user._id, user.isAdmin);
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin
  });
});

// Logout
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ message: 'Logged out' });
});

// Get profile
const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  res.json(user);
});

// Update profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;

  if (req.body.password) user.password = req.body.password;

  const updated = await user.save();

  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    isAdmin: updated.isAdmin
  });
});

module.exports = {
  registerUser,
  authUser,
  googleLogin,
  requestOtp,
  verifyPhoneOtp,
  logoutUser,
  getProfile,
  updateProfile
};
