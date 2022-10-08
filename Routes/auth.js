const express = require('express');
const {
  register,
  login,
  getCurrentLoggedInUser,
  forgotPassword,
  resetPassword,
  UpdateUserDetails,
  UpdatePassword,
} = require('../Controllers/auth');
const { protect } = require('../Middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/currentuser', protect, getCurrentLoggedInUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updateuserdetails', protect, UpdateUserDetails);
router.put('/updatepassword', protect, UpdatePassword);

module.exports = router;
