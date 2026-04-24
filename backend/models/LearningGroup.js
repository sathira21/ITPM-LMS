const mongoose = require('mongoose');

const learningGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    subject: { type: String, default: '' },
    category: {
      type: String,
      enum: ['study', 'project', 'discussion', 'practice', 'exam-prep'],
      default: 'study',
    },
    coverColor: { type: String, default: '#6366f1' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['owner', 'moderator', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    maxMembers: { type: Number, default: 50 },
    isPublic: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningGroup', learningGroupSchema);
