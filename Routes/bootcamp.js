const express = require('express');
const router = express.Router();
const {
  getBootcamps,
  getSingleBootcamp,
  postBootcamp,
  putBootcamp,
  deleteBootcamp,
  getBootcampsinRadius,
} = require('../Controllers/bootcamps');
//Include other resources route
const courseRouter = require('./course');

//Re-route into other resource router'
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsinRadius);
router.route('/').get(getBootcamps).post(postBootcamp);
router
  .route('/:id')
  .put(putBootcamp)
  .get(getSingleBootcamp)
  .delete(deleteBootcamp);
module.exports = router;
