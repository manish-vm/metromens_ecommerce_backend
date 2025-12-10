const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isAdmin = req.body.isAdmin ?? user.isAdmin;
  const updated = await user.save();
  res.json(updated);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.deleteOne();
  res.json({ message: 'User removed' });
});

// Basic dashboard stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalOrders = await Order.countDocuments();
  const paidOrders = await Order.find({ isPaid: true });

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  res.json({
    totalUsers,
    totalOrders,
    totalRevenue
  });
});

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
  getDashboardStats
};
