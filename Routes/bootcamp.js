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
const reviewRouter = require('./review');

//Re-route into other resource router'
// to get bootcamp related courses
router.use('/:bootcampId/courses', courseRouter);
//to get bootcamp related reviews
router.use('/:bootcampId/reviews', reviewRouter);

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
