const express = require('express');
const router = express.Router();
const {
getBootcamps,
getSingleBootcamp,
postBootcamp,
putBootcamp,
deleteBootcamp
} = require("../Controllers/bootcamps")

router.route('/').get(getBootcamps).post(postBootcamp)
router.route('/:id').put(putBootcamp).get(getSingleBootcamp).delete(deleteBootcamp)
module.exports= router;