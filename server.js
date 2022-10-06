const express = require('express');
const dotenv = require('dotenv');
const bootcamps = require('./Routes/bootcamp');
const courses = require('./Routes/course');
const morgan = require('morgan');
const connectDb = require('./config/db');
const colors = require('colors');
const errorHandler = require('./Middleware/errorHandler');

dotenv.config({ path: './config/config.env' });

const app = express();

//body parser
app.use(express.json());

//Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//connect db
connectDb();

//bootcamp
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

// as it executes linearly so must be place after the handler
app.use(errorHandler);

//port number
const PORT = process.env.PORT || 5000;
// app listening to the port
const server = app.listen(
  PORT,
  console.log(
    `App is Running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

//handle unhandled rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error:${err.message}`.red);
  server.close(() => process.exit(1));
});
//npm run dev for development
//npm start for production
