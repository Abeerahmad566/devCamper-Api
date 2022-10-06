const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

//load env vairables
dotenv.config({ path: './config/config.env' });

//load models
const Bootcamp = require('./Models/Bootcamp');
const Course = require('./Models/Course');
//connect to DB
const connectDB = mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
});

//read JSON files

const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
);
const Courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
);

//Import data into Db
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(Courses);
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//Delete data
const deleteData = async () => {
  try {
    await connectDB;
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    console.log('Data Destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//argv is a inbuild application process moddule which is used to pass arguments to nodejs process when run in command line

if (process.argv[2] === '-d') {
  deleteData();
} else if (process.argv[2] === '-i') {
  importData();
}