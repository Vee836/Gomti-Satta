const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUserStatus, deleteUser } = require('../controllers/userController');
const { protect, admin, adminOrSubAdmin } = require('../middleware/auth');

router.route('/')
  .get(protect, adminOrSubAdmin, getUsers)
  .post(protect, admin, createUser);

router.route('/:id/status')
  .put(protect, adminOrSubAdmin, updateUserStatus);

router.route('/:id')
  .delete(protect, admin, deleteUser);

module.exports = router;
