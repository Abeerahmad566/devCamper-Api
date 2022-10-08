const asyncHandler = require('../Middleware/async');
const errorResponse = require('../utils/errorResponse');
const User = require('../Models/User');

//@desc     Get all user
//@route    GET /api/v1/auth/users
//@access   private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc     Get Single user
//@route    GET /api/v1/auth/users/:id
//@access   private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({ success: true, data: user });
});

//@desc     Add  user
//@route    POST /api/v1/auth/users
//@access   private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

//@desc     Update user
//@route    PUT /api/v1/auth/users/:id
//@access   private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

//@desc     Delete user
//@route    DELETE /api/v1/auth/users/:id
//@access   private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: user });
});
