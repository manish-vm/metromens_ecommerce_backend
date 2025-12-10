const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getUsers,
  updateUserRole,
  deleteUser,
  getDashboardStats
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes are protected + admin only
router.use(protect);
router.use(adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
