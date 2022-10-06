const express = require('express');
const {
  getCourse,
  getSingleCourse,
  postCourse,
} = require('../Controllers/course');
const router = express.Router({ mergeParams: true });

router.route('/').get(getCourse).post(postCourse);
router.route('/:id').get(getSingleCourse);

module.exports = router;
