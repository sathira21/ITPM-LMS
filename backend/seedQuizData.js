require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
const QuizAttempt = require('./models/QuizAttempt');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const students = await User.find({ role: 'student' });
    const quizzes = await Quiz.find({ isPublished: true });

    if (students.length === 0 || quizzes.length === 0) {
      console.log('No students or quizzes found. Exiting.');
      process.exit(0);
    }

    // Clear existing attempts to ensure "100 correct data"
    await QuizAttempt.deleteMany({});
    console.log('Cleared existing quiz attempts.');

    for (const quiz of quizzes) {
      console.log(`Seeding attempts for quiz: ${quiz.title}`);
      
      for (const student of students) {
        // Create 1-2 attempts per student
        const numAttempts = Math.floor(Math.random() * 2) + 1;
        
        for (let i = 0; i < numAttempts; i++) {
          const score = Math.floor(Math.random() * (100 - 70 + 1)) + 70; // 70-100%
          const totalPoints = quiz.totalPoints || quiz.questions.reduce((s, q) => s + (q.points || 1), 0);
          const pointsEarned = Math.round((score / 100) * totalPoints);
          const passed = score >= quiz.passingScore;
          
          const gradedAnswers = quiz.questions.map(q => ({
            questionId: q._id,
            answer: 'Seeded Answer',
            isCorrect: Math.random() > 0.2, // 80% chance of being correct per question
            pointsEarned: Math.random() > 0.2 ? (q.points || 1) : 0
          }));

          // Recalculate true score from graded answers
          const actualScore = gradedAnswers.reduce((s, a) => s + a.pointsEarned, 0);
          const actualPercentage = Math.round((actualScore / totalPoints) * 100);

          await QuizAttempt.create({
            quiz: quiz._id,
            student: student._id,
            answers: gradedAnswers,
            score: actualScore,
            totalPoints,
            percentage: actualPercentage,
            passed: actualPercentage >= quiz.passingScore,
            startedAt: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000 * Math.random())), // Last 7 days
            submittedAt: new Date(),
            timeSpent: Math.floor(Math.random() * 600) + 300 // 5-15 mins
          });
        }
      }
    }

    console.log('Successfully seeded quiz attempts.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seed();
