const express = require('express');
const router = express.Router();
const {
  getBootcamps,
  getSingleBootcamp,
  postBootcamp,
  putBootcamp,
  deleteBootcamp,
  getBootcampsinRadius,
  BootcampPhotoUpload,
} = require('../Controllers/bootcamps');
const Bootcamp = require('../Models/Bootcamp');
const advancedResults = require('../Middleware/advancedResults');
const { protect, authorize } = require('../Middleware/auth');

//Include other resources route
const courseRouter = require('./course');

//Re-route into other resource router'
router.use('/:bootcampId/courses', courseRouter);

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), BootcampPhotoUpload);
router.route('/radius/:zipcode/:distance').get(getBootcampsinRadius);
router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), postBootcamp);
router
  .route('/:id')
  .put(protect, authorize('publisher', 'admin'), putBootcamp)
  .get(getSingleBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);
module.exports = router;
