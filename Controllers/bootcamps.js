const asyncHandler = require('../Middleware/async');
const errorResponse = require('../utils/errorResponse');
const Bootcamp = require('../Models/Bootcamp');
const geocoder = require('../utils/GeoCoder');

//@desc     Get All BootCamps
//@route    GET /api/v1/bootcamps
//@access   public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;
  // making copy of req.query
  const reqQuery = { ...req.query };

  //fields to remove
  const removeFields = ['select', 'sort', 'page', 'limit'];

  //loop over remove fields and remove them from query
  removeFields.forEach((param) => delete reqQuery[param]);

  // converting query into string
  let queryStr = JSON.stringify(reqQuery);
  // adding dollar sign infront of match
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

  //Finding Resources
  query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  //select Fields
  if (req.query.select) {
    //.split seperate them where is , and the join is make string with " "
    const fields = req.query.select.split(',').join(' ');
    //parse use to convert back into object
    query = query.select(fields);
  }

  //sort fields
  if (req.query.sort) {
    const sortby = req.query.split(',').join(' ');
    query = query.select(sortby);
  } else {
    query = query.sort('-createdAt');
  }

  //pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  const bootcamps = await query;

  //pagination
  const pagination = {};
  let cuurentPage;
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    };
  }

  res.status(200).json({
    sucess: true,
    pagination,
    pageNumber: page,
    count: bootcamps.length,
    data: bootcamps,
  });
});

//@desc     Get single BootCamps
//@route    GET /api/v1/bootcamps/:id
//@access   public
exports.getSingleBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new errorResponse(`BootCamp not Found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ sucess: true, data: bootcamp });
});
//@desc     Post BootCamps
//@route    POST /api/v1/bootcamps
//@access   private
exports.postBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await BootCamp.create(req.body);
  res.status(201).json({ sucess: true, data: bootcamp });
});
//@desc     Put BootCamps
//@route    PUT /api/v1/bootcamps/:id
//@access   private
exports.putBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return next(
      new errorResponse(`BootCamp not Found with id of ${req.params.id}`, 404)
    );
  }
  res.status(201).json({ sucess: true, data: bootcamp });
});

//@desc     Delete BootCamps
//@route    DELETE /api/v1/bootcamps/:id
//@access   private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new errorResponse(`BootCamp not Found with id of ${req.params.id}`, 404)
    );
  }
  bootcamp.remove();
  res.status(200).json({ sucess: true, data: bootcamp });
});

//@desc     Get BootCamps Within Radius
//@route    GET /api/v1/bootcamps/radius/:zipcode/:distance
//@access   private
exports.getBootcampsinRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  const loc = await geocoder.geocode(zipcode);

  const longitude = loc[0].longitude;
  const latitude = loc[0].latitude;

  //calculate radius using radians
  //divide distance by radius of earth
  // earth radius is 3963miles / 6378km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });

  if (!bootcamps) {
    return next(
      new errorResponse(`BootCamp not Found near your location`, 404)
    );
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
