const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:     { type: Date, required: true }, // UTC start-of-day

  metrics: {
    quizAttempts:    { type: Number, default: 0 },
    quizAvgScore:    { type: Number, default: 0 }, // 0–100
    quizBestScore:   { type: Number, default: 0 },
    loginActive:     { type: Boolean, default: false },
    groupActivities: { type: Number, default: 0 },
    feedbackGiven:   { type: Number, default: 0 },
    materialsViewed: { type: Number, default: 0 },
  },

  progressScore:        { type: Number, default: 0 }, // 0–100 composite
  quizComponent:        { type: Number, default: 0 },
  engagementComponent:  { type: Number, default: 0 },
  consistencyComponent: { type: Number, default: 0 },
  streak:               { type: Number, default: 0 }, // consecutive active days
}, { timestamps: true });

progressSchema.index({ student: 1, date: -1 });
progressSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('StudentProgress', progressSchema);
