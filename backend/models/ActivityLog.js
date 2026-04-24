const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g. 'LOGIN', 'VIEW_REPORT', 'JOIN_GROUP'
    category: {
      type: String,
      enum: ['auth', 'user', 'report', 'group', 'guardian', 'dashboard', 'system'],
      default: 'system',
    },
    details: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    status: { type: String, enum: ['success', 'failed', 'warning'], default: 'success' },
  },
  { timestamps: true }
);

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ category: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
