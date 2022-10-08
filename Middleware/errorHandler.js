const errorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  //console.log(err.stack.red.bold)

  //Mongoose bad objectId format
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new errorResponse(message, 404);
  }
  //Mongoose duplicate object
  if (err.code === 11000) {
    const message = `Data Already Exist`;
    error = new errorResponse(message, 400);
  }
  //Mongoose validation error (empty required fields)
  if (err.name === 'ValidationError') {
    //errors is an array of validation errors so getting the required error from there
    const message = Object.values(err.errors).map((val) => val.message);
    error = new errorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
  });
};
module.exports = errorHandler;
