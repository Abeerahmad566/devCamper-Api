const express = require('express');
const {
  register,
  login,
  getCurrentLoggedInUser,
} = require('../Controllers/auth');
const { protect } = require('../Middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/currentuser', protect, getCurrentLoggedInUser);

module.exports = router;
