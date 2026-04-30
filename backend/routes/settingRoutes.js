const express = require('express');
const router = express.Router();
const { getSettings, getPublicSettings, updateSetting } = require('../controllers/settingController');
const { protect, admin } = require('../middleware/auth');

router.get('/public', getPublicSettings);

router.route('/')
  .get(protect, admin, getSettings)
  .post(protect, admin, updateSetting);

module.exports = router;
