const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin or Sub-Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'user',
  });

  if (user) {
    await ActivityLog.create({
      userId: req.user._id,
      action: 'Create User',
      description: `Created user ${user.email}`,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Update user status (Block/Unblock)
// @route   PUT /api/users/:id/status
// @access  Private/Admin or SubAdmin
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Prevent blocking root admin
    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot block an admin user');
    }

    user.status = req.body.status || user.status;
    const updatedUser = await user.save();

    await ActivityLog.create({
      userId: req.user._id,
      action: 'Update User Status',
      description: `Updated status of ${user.email} to ${user.status}`,
    });

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      status: updatedUser.status,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot delete an admin user');
    }

    // Use deleteOne instead of remove
    await User.deleteOne({ _id: user._id });

    await ActivityLog.create({
      userId: req.user._id,
      action: 'Delete User',
      description: `Deleted user ${user.email}`,
    });

    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = { getUsers, createUser, updateUserStatus, deleteUser };
