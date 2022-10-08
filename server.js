const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const bootcamps = require('./Routes/bootcamp');
const auth = require('./Routes/auth');
const users = require('./Routes/users');
const courses = require('./Routes/course');
const reviews = require('./Routes/review');
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

//file upload
app.use(fileupload());

//cookie parser
app.use(cookieParser());

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Mount Routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

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
