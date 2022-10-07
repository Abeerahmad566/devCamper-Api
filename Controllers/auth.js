const asyncHandler = require('../Middleware/async');
const errorResponse = require('../utils/errorResponse');
const User = require('../Models/User');

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
