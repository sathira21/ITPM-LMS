const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function migrateIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('contentprogresses');

    // Get existing indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop the old index if it exists
    const oldIndex = indexes.find(i => i.name === 'student_1_material_1');
    if (oldIndex) {
      console.log('Dropping old index: student_1_material_1');
      await collection.dropIndex('student_1_material_1');
      console.log('Old index dropped successfully!');
    } else {
      console.log('Old index not found, skipping drop');
    }

    // Check if new index exists
    const newIndex = indexes.find(i => i.name === 'student_1_material_1_course_1');
    if (!newIndex) {
      console.log('Creating new index: student_1_material_1_course_1');
      await collection.createIndex(
        { student: 1, material: 1, course: 1 },
        { unique: true }
      );
      console.log('New index created successfully!');
    } else {
      console.log('New index already exists');
    }

    // Optional: Clear old progress data that doesn't have course field
    // Uncomment if you want to start fresh
    // const result = await collection.deleteMany({ course: { $exists: false } });
    // console.log(`Deleted ${result.deletedCount} old progress records without course field`);

    // Show final indexes
    const finalIndexes = await collection.indexes();
    console.log('\nFinal indexes:', finalIndexes.map(i => ({ name: i.name, key: i.key })));

    console.log('\n✅ Migration completed!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrateIndex();
