const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  startedAt: { type: Date, required: true },
  endedAt: { type: Date, default: null },
  duration: { type: Number, default: 0 },
}, { _id: false });

const contentProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null, // null = standalone material (not in a course)
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    firstViewedAt: { type: Date, default: null },
    lastViewedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    completedBy: {
      type: String,
      enum: ['auto', 'manual', null],
      default: null,
    },
    totalTimeSpent: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    sessions: [sessionSchema],
  },
  { timestamps: true }
);

// Compound unique index - one progress record per student-material-course combination
contentProgressSchema.index({ student: 1, material: 1, course: 1 }, { unique: true });
// Query optimization indexes
contentProgressSchema.index({ student: 1, status: 1 });
contentProgressSchema.index({ material: 1, status: 1 });
contentProgressSchema.index({ student: 1, course: 1 }); // For course-specific progress queries
contentProgressSchema.index({ course: 1, status: 1 }); // For course analytics
contentProgressSchema.index({ student: 1, createdAt: -1 });
contentProgressSchema.index({ completedAt: -1 });

module.exports = mongoose.model('ContentProgress', contentProgressSchema);
