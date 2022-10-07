const asyncHandler = require('../Middleware/async');
const errorResponse = require('../utils/errorResponse');
const Course = require('../Models/Course');
const geocoder = require('../utils/GeoCoder');
const Bootcamp = require('../Models/Bootcamp');
//@desc     Get All Course
//@route    GET /api/v1/courses
//@route    GET /api/v1/bootcamps/:bootcampId/courses
//@access   public
exports.getCourse = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = Course.find({ bootcamp: req.params.bootcampId });

    res.status(200).json({
      sucess: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc     Get single Course
//@route    GET /api/v1/courses/:id
//@access   public
exports.getSingleCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new errorResponse(`Course not Found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ sucess: true, data: course });
});
//@desc     Post Course
//@route    POST /api/v1/bootcamps/:bootcampid/courses
//@access   private
exports.postCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;
  console.log(req.body.user);
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new errorResponse(
        `Bootcamp not Found with id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  //make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new errorResponse(
        `User ${req.user.name} is not Authorize to add a course to ${bootcamp.name} bootcamp`,
        404
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({ sucess: true, data: course });
});
//@desc     Put Course
//@route    PUT /api/v1/courses/:id
//@access   private
exports.putCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new errorResponse(`Course not Found with id of ${req.params.id}`, 404)
    );
  }
  //make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new errorResponse(
        `User ${req.user.name} is not Authorize to update a ${course.title} course   `,
        404
      )
    );
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({ sucess: true, data: course });
});

//@desc     Delete Course
//@route    DELETE /api/v1/courses/:id
//@access   private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new errorResponse(`Course not Found with id of ${req.params.id}`, 404)
    );
  }

  //make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new errorResponse(
        `User ${req.user.name} is not Authorize to Delete a ${course.title} course   `,
        404
      )
    );
  }

  await course.remove();
  res.status(200).json({ sucess: true, data: {} });
});
