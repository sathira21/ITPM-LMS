require('dotenv').config();
const mongoose = require('mongoose');

async function debug() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/itpm-lms');
  const Course = require('./models/Course');
  const User = require('./models/User');

  const students = await User.find({ role: 'student' });
  const courses = await Course.find({ status: 'published' });

  students.forEach(s => {
    const studentIdStr = s._id.toString();
    console.log(`Checking student: ${s.name} (${studentIdStr})`);
    
    courses.forEach(c => {
      const match = c.enrolledStudents.find(e => e.student && e.student.toString() === studentIdStr);
      if (match) {
        console.log(`  MATCH found in course: ${c.code} | Status: ${match.status}`);
      }
    });
  });

  process.exit(0);
}

debug();
