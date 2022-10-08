const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../Controllers/users');
const User = require('../Models/User');
const { protect, authorize } = require('../Middleware/auth');
const advancedResults = require('../Middleware/advancedResults');
const router = express.Router();

router.use(protect, authorize('admin'));
router.route('/').get(advancedResults(User), getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);
module.exports = router;
