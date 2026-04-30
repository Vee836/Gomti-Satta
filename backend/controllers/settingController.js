const asyncHandler = require('express-async-handler');
const Setting = require('../models/Setting');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.find({});
  res.json(settings);
});

// @desc    Get public settings
// @route   GET /api/settings/public
// @access  Public
const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.find({ key: { $in: ['siteName'] } });
  res.json(settings);
});

// @desc    Update or create a setting
// @route   POST /api/settings
// @access  Private/Admin
const updateSetting = asyncHandler(async (req, res) => {
  const { key, value, description } = req.body;

  let setting = await Setting.findOne({ key });

  if (setting) {
    setting.value = value;
    if (description) setting.description = description;
    await setting.save();
  } else {
    setting = await Setting.create({ key, value, description });
  }

  await ActivityLog.create({
    userId: req.user._id,
    action: 'Update Setting',
    description: `Updated setting: ${key}`,
  });

  res.json(setting);
});

module.exports = { getSettings, getPublicSettings, updateSetting };
