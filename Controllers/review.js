const asyncHandler = require('../Middleware/async');
const errorResponse = require('../utils/errorResponse');
const Review = require('../Models/Review');
const Bootcamp = require('../Models/Bootcamp');

//@desc     Get All Reviews
//@route    GET /api/v1/reviews
//@route    GET /api/v1/bootcamps/:bootcampId/reviews
//@access   public
exports.getReviews = asyncHandler(async (req, res, next) => {
  //will get bootcamp related reviews from here
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    res.status(200).json({
      sucess: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    //will get all reviews from here
    res.status(200).json(res.advancedResults);
  }
});

//@desc     Get Single Review
//@route    GET /api/v1/reviews/:id
//@access   private
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!review) {
    return next(new errorResponse('No Review Found', 404));
  }

  res.status(200).json({
    sucess: true,
    data: review,
  });
});

//@desc     Post Review
//@route    GET /api/v1/bootcamp/:bootcampid/reviews
//@access   private
exports.createReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(new errorResponse('No Bootcamp Found', 404));
  }
  const review = await Review.create(req.body);
  res.status(200).json({
    sucess: true,
    data: review,
  });
});

//@desc     update Review
//@route    PUT /api/v1/reviews/:id
//@access   private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  if (!review) {
    return next(new errorResponse('No Review Found', 404));
  }

  //make sure review belongs to user or admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new errorResponse(
        `User ${req.user.name} is not Authorize to update a ${review.title} course   `,
        404
      )
    );
  }
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    sucess: true,
    data: review,
  });
});
//@desc     Delete Course
//@route    DELETE /api/v1/reviews/:id
//@access   private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new errorResponse(`Review not Found with id of ${req.params.id}`, 404)
    );
  }

  //make sure user is course owner
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new errorResponse(
        `User ${req.user.name} is not Authorize to Delete a "${review.title}" review   `,
        404
      )
    );
  }

  await review.remove();
  res.status(200).json({ sucess: true, data: review });
});
