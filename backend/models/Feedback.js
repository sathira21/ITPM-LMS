//feedback setup
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isAnonymous: { type: Boolean, default: false },

    // What the feedback is about
    category: {
      type: String,
      enum: ['lesson', 'quiz', 'material', 'session', 'platform', 'general'],
      default: 'general',
    },
    subject: { type: String, default: '' },       // e.g. "Mathematics"
    module: { type: String, default: '' },         // e.g. "Week 3 – Algebra"
    targetType: {
      type: String,
      enum: ['material', 'group', 'general'],
      default: 'general',
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    targetName: { type: String, default: '' },     // human-readable reference

    // Content
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: null },  // star rating

    // Moderation
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
    adminResponse: { type: String, default: '' },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

feedbackSchema.index({ submittedBy: 1, createdAt: -1 });
feedbackSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
