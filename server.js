const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const morgan = require('morgan');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const color = require('colors');
const cors = require('cors');
const bootcamps = require('./Routes/bootcamp');
const auth = require('./Routes/auth');
const users = require('./Routes/users');
const courses = require('./Routes/course');
const reviews = require('./Routes/review');

const connectDb = require('./config/db');

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

//Sanitiza data
app.use(mongoSanitize());

//Set Security Headers
app.use(helmet());

//Prevent Xss attacks
app.use(xss());

//prevent http param pollution(giving same elements in array to expliot the mechanisim)
app.use(hpp());

//Request limiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10minutes
  max: 100,
});
app.use(limiter);

//Enable cors
app.use(cors());

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
