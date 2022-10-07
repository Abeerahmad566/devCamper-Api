const asyncHandler = require('../Middleware/async');
const errorResponse = require('../utils/errorResponse');
const Bootcamp = require('../Models/Bootcamp');
const geocoder = require('../utils/GeoCoder');

//@desc     Get All BootCamps
//@route    GET /api/v1/bootcamps
//@access   public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
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
  //Adding User to body
  req.body.user = req.user.id;

  //Checked for published bootcamps
  const publishedBootcamps = await Bootcamp.findOne({ user: req.user.id });

  //if the user role is not admin, they can add only one bootcamp
  if (publishedBootcamps && req.user.role !== 'admin') {
    return next(
      new errorResponse(
        `The user ${req.user.name} has already published a bootcamp`,
        400
      )
    );
  }
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ sucess: true, data: bootcamp });
});
//@desc     Put BootCamps
//@route    PUT /api/v1/bootcamps/:id
//@access   private
exports.putBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new errorResponse(`BootCamp not Found with id of ${req.params.id}`, 404)
    );
  }
  //make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new errorResponse(
        `User ${req.user.name} is not Authorize to update the bootcamp`,
        404
      )
    );
  }

  bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

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
  //make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new errorResponse(
        `User ${req.user.name} is not the Authorize to delete the bootcamp`,
        404
      )
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
//@desc     Upload Photo for BootCamps
//@route    PUT /api/v1/bootcamps/:id/photo
//@access   private
exports.BootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new errorResponse(`BootCamp not Found with id of ${req.params.id}`, 404)
    );
  }
  //make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new errorResponse(
        `User ${req.user.name} is not Authorize to update the bootcamp`,
        404
      )
    );
  }
  if (!req.files) {
    return next(new errorResponse(`Please Upload File`, 400));
  }

  const file = req.files.file;

  // Make sure file is photo
  if (!file.mimetype.startsWith('image')) {
    return next(new errorResponse(`Please Upload a Image File`, 400));
  }

  //check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new errorResponse(
        `Please Upload a Image File less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }
  //create custome file name
  //path.parse(filename).ext to get extension
  file.name = `photo-${bootcamp._id}-${file.name}`;
  //.mv built function to move files

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new errorResponse(`Problem with file Upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.param.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
