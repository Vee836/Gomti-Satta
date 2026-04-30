const express = require('express');
const router = express.Router();
const { getResults, getPublicResults, createResult, updateResult, deleteResult } = require('../controllers/resultController');
const { protect, admin, adminOrSubAdmin } = require('../middleware/auth');

router.get('/public', getPublicResults);

router.route('/')
  .get(protect, getResults)
  .post(protect, adminOrSubAdmin, createResult);

router.route('/:id')
  .put(protect, adminOrSubAdmin, updateResult)
  .delete(protect, admin, deleteResult);

module.exports = router;
