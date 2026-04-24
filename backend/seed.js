require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const USERS = [
  { name: 'Admin User',      email: 'admin@lms.com',    password: 'admin123',    role: 'admin',    isApproved: true, registrationType: 'admin' },
  { name: 'Sarah Johnson',   email: 'teacher@lms.com',  password: 'teacher123',  role: 'teacher',  isApproved: true, registrationType: 'admin', subjects: ['Mathematics', 'Science'] },
  { name: 'Alex Fernando',   email: 'student@lms.com',  password: 'student123',  role: 'student',  isApproved: true, registrationType: 'admin', studentId: 'STU-2025-001', grade: 'Grade 10A' },
  { name: 'David Silva',     email: 'student2@lms.com', password: 'student123',  role: 'student',  isApproved: true, registrationType: 'admin', studentId: 'STU-2025-002', grade: 'Grade 10B' },
  { name: 'Maria Silva',     email: 'guardian@lms.com', password: 'guardian123', role: 'guardian', isApproved: true, registrationType: 'admin', relationship: 'Mother' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    for (const u of USERS) {
      await User.create(u);
      console.log(`Created ${u.role}: ${u.email}`);
    }

    console.log('\n✅ Seed complete! Demo accounts:');
    console.log('  admin@lms.com     / admin123');
    console.log('  teacher@lms.com   / teacher123');
    console.log('  student@lms.com   / student123');
    console.log('  guardian@lms.com  / guardian123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
