const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ['mcq', 'true_false', 'short_answer'], required: true },
  question: { type: String, required: true, trim: true },
  options: [{ type: String }],
  correctAnswer: { type: String, default: '' },
  explanation: { type: String, default: '' },
  points: { type: Number, default: 1 },
}, { _id: true });

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  subject: { type: String, default: '' },
  module: { type: String, default: '' },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningGroup', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [questionSchema],
  timeLimit: { type: Number, default: 0 },       // minutes, 0 = unlimited
  passingScore: { type: Number, default: 60 },   // percentage
  isPublished: { type: Boolean, default: false },
  allowRetake: { type: Boolean, default: true },
  maxAttempts: { type: Number, default: 3 },
  dueDate: { type: Date, default: null },
  totalPoints: { type: Number, default: 0 },
}, { timestamps: true });

quizSchema.pre('save', function (next) {
  this.totalPoints = this.questions.reduce((s, q) => s + (q.points || 1), 0);
  next();
});

quizSchema.index({ createdBy: 1, isPublished: 1 });
quizSchema.index({ subject: 1, module: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
