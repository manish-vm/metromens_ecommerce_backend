const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');

const getUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let filter = {};

  if (search) {
    filter = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    };
  }

  const users = await User.find(filter).select('-password');
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

// Enhanced dashboard stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalOrders = await Order.countDocuments();
  const paidOrders = await Order.find({ isPaid: true });
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  // Order status distribution
  const orderStatuses = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Recent orders (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentOrders = await Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

  // Revenue by month (last 6 months)
  const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
  const revenueByMonth = await Order.aggregate([
    { $match: { isPaid: true, createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$totalPrice' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Top products by sales
  const topProducts = await Order.aggregate([
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        totalSold: { $sum: '$orderItems.qty' },
        revenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        name: '$product.name',
        totalSold: 1,
        revenue: 1
      }
    }
  ]);

  res.json({
    totalUsers,
    totalOrders,
    totalRevenue,
    recentOrders,
    orderStatuses,
    revenueByMonth,
    topProducts
  });
});

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
  getDashboardStats
};
