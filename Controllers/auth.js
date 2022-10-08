const crypto = require('crypto');
const asyncHandler = require('../Middleware/async');
const errorResponse = require('../utils/errorResponse');
const User = require('../Models/User');
const { sendEmail } = require('../utils/sendEmail');

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

//@desc     Login user
//@route    POST /api/v1/auth/login
//@access   public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //validate email and password
  if (!email || !password) {
    return next(new errorResponse('Please Provide Email and Password'), 400);
  }
  //check user exist or not    || adding password as we set false it in model to validate it
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new errorResponse('Invalid Credentials'), 401);
  }

  //check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new errorResponse('Invalid Credentials'), 401);
  }

  sendTokenResponse(user, 200, res);
});

//@desc     Get Current Loged in user
//@route    POST /api/v1/auth/currentuser
//@access   private
exports.getCurrentLoggedInUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc     Update user Details
//@route    PUT /api/v1/auth/updateuserdetails
//@access   private
exports.UpdateUserDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc    Update Password
//@route    Put /api/v1/auth/updatepassword
//@access   private
exports.UpdatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  //check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new errorResponse('Password is incorrect', 401));
  }
  user.password = req.body.newPassword;
  await user.save();
  //sending token back
  sendTokenResponse(user, 200, res);
  // res.status(200).json({
  //   success: true,
  //   data: user,
  // });
});

//@desc     Forgot Password
//@route    POST /api/v1/auth/forgotpassword
//@access   public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new errorResponse('No User Found with this email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  //saving resetToken and Expire in database
  await user.save({ validateBeforeSave: false });

  //create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;
  //making message to send in email
  const message = `You are recieving this email because you(or someone else ) has 
  requested the reset of a password.Please make a PUT request to :\n\n ${resetUrl}`;

  try {
    console.log(user.email);
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message,
    });

    res.status(200).json({ success: true, data: 'Email Sent' });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new errorResponse('Email could not be send', 500));
  }
});

//@desc     Reset Password
//@route    POST /api/v1/auth/resetpassword/:resettoken
//@access   public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new errorResponse('Invalid Token', 400));
  }

  //set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

//Helper function
const sendTokenResponse = (user, statusCode, res) => {
  //create token
  const token = user.getSignedJwtToken();

  const options = {
    expire: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, //only need this on client side
  };
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options) // key,value,options
    .json({
      success: true,
      token,
    });
};
