const asyncHandler = require('express-async-handler');
const Result = require('../models/Result');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all results (Admin)
// @route   GET /api/results
// @access  Private
const getResults = asyncHandler(async (req, res) => {
  const results = await Result.find({}).sort({ createdAt: -1 }).populate('createdBy', 'name email');
  res.json(results);
});

// @desc    Get public results (executed and pending for schedule)
// @route   GET /api/results/public
// @access  Public
const getPublicResults = asyncHandler(async (req, res) => {
  const results = await Result.find({ status: { $in: ['executed', 'pending'] } })
    .sort({ updatedAt: -1 })
    .select('title data updatedAt scheduledDate status');
  res.json(results);
});

// @desc    Create new result
// @route   POST /api/results
// @access  Private/Admin or SubAdmin
const createResult = asyncHandler(async (req, res) => {
  const { title, data, scheduledDate, status } = req.body;

  const result = new Result({
    title,
    data,
    scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
    status: status || (scheduledDate ? 'pending' : 'executed'),
    createdBy: req.user._id,
    history: [{
      updatedBy: req.user._id,
      changes: 'Created result',
      timestamp: Date.now()
    }]
  });

  const createdResult = await result.save();

  await ActivityLog.create({
    userId: req.user._id,
    action: 'Create Result',
    description: `Created result: ${title}`,
  });

  res.status(201).json(createdResult);
});

// @desc    Update a result
// @route   PUT /api/results/:id
// @access  Private/Admin or SubAdmin
const updateResult = asyncHandler(async (req, res) => {
  const { title, data, scheduledDate, status, changeReason } = req.body;
  const result = await Result.findById(req.params.id);

  if (result) {
    result.title = title || result.title;
    result.data = data || result.data;
    if (scheduledDate !== undefined) result.scheduledDate = scheduledDate;
    if (status !== undefined) result.status = status;

    result.history.push({
      updatedBy: req.user._id,
      changes: changeReason || 'Updated result data/details',
      timestamp: Date.now()
    });

    const updatedResult = await result.save();

    await ActivityLog.create({
      userId: req.user._id,
      action: 'Update Result',
      description: `Updated result: ${result.title}`,
    });

    res.json(updatedResult);
  } else {
    res.status(404);
    throw new Error('Result not found');
  }
});

// @desc    Delete a result
// @route   DELETE /api/results/:id
// @access  Private/Admin
const deleteResult = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id);

  if (result) {
    await Result.deleteOne({ _id: result._id });
    
    await ActivityLog.create({
      userId: req.user._id,
      action: 'Delete Result',
      description: `Deleted result: ${result.title}`,
    });

    res.json({ message: 'Result removed' });
  } else {
    res.status(404);
    throw new Error('Result not found');
  }
});

module.exports = { getResults, getPublicResults, createResult, updateResult, deleteResult };
