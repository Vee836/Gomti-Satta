const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Result = require('../models/Result');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({});
  const activeUsers = await User.countDocuments({ status: 'active' });
  const pendingResults = await Result.countDocuments({ status: 'pending' });

  // Get start of today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Results updated today
  const dailyUpdates = await Result.countDocuments({ updatedAt: { $gte: startOfDay } });

  // Get recent activity
  const recentActivities = await ActivityLog.find({})
    .sort({ timestamp: -1 })
    .limit(10)
    .populate('userId', 'name email role');

  res.json({
    totalUsers,
    activeUsers,
    pendingResults,
    dailyUpdates,
    recentActivities
  });
});

module.exports = { getDashboardStats };
