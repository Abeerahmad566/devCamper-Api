const express = require('express');
const {
  getCourse,
  getSingleCourse,
  postCourse,
  putCourse,
  deleteCourse,
} = require('../Controllers/course');
const Course = require('../Models/Course');
const advancedResults = require('../Middleware/advancedResults');
const { protect, authorize } = require('../Middleware/auth');
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'bootcamp',
      select: 'name description',
    }),
    getCourse
  )
  .post(protect, authorize('publisher', 'admin'), postCourse);
router
  .route('/:id')
  .get(getSingleCourse)
  .put(protect, authorize('publisher', 'admin'), putCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
