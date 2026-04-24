const mongoose = require('mongoose');

const notifSchema = new mongoose.Schema({
  student:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['progress_drop', 'streak_break', 'milestone', 'weekly_summary', 'quiz_decline'],
    required: true,
  },
  severity: { type: String, enum: ['info', 'warning', 'danger'], default: 'info' },
  title:    { type: String, required: true },
  message:  { type: String, required: true },

  // Drop-specific
  previousScore: { type: Number },
  currentScore:  { type: Number },
  dropPercent:   { type: Number },

  // Milestone-specific
  milestone: { type: String },

  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notifSchema.index({ student: 1, createdAt: -1 });
notifSchema.index({ student: 1, isRead: 1 });

module.exports = mongoose.model('ProgressNotification', notifSchema);
