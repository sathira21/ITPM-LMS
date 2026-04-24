const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    period: { type: String, default: '' }, // e.g. "Term 1 2025"
    academicYear: { type: String, default: '' },
    grades: [
      {
        subject: String,
        score: Number,
        maxScore: Number,
        grade: String,
        remarks: String,
      },
    ],
    attendance: {
      totalDays: { type: Number, default: 0 },
      presentDays: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
    },
    overallGrade: { type: String, default: '' },
    gpa: { type: Number, default: 0 },
    teacherRemarks: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
