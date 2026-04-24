const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  fileName:  { type: String, required: true },
  fileUrl:   { type: String, required: true },
  fileKey:   { type: String, required: true },
  fileSize:  { type: Number, default: 0 },
  mimeType:  { type: String, default: '' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: true, timestamps: false });

const replySchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message:     { type: String, required: true, trim: true },
  attachments: [attachmentSchema],
  createdAt:   { type: Date, default: Date.now },
}, { _id: true });

const supportTicketSchema = new mongoose.Schema(
  {
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    subject:     { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    category: {
      type: String,
      enum: ['account', 'technical', 'academic', 'billing', 'other'],
      default: 'other',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },

    // AI auto-detected priority
    aiDetectedPriority: { type: String, enum: ['low', 'medium', 'high', 'urgent', null], default: null },
    aiPriorityKeywords: [{ type: String }],

    // File attachments on the ticket itself
    attachments: [attachmentSchema],

    // Conversation thread
    replies: [replySchema],

    // SLA tracking
    sla: {
      dueAt:      { type: Date, default: null },
      breached:   { type: Boolean, default: false },
      breachedAt: { type: Date, default: null },
    },

    // Satisfaction rating (student rates after resolution)
    satisfaction: {
      rating:  { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, default: '' },
      ratedAt: { type: Date, default: null },
    },

    assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt:  { type: Date, default: null },
    closedAt:    { type: Date, default: null },
  },
  { timestamps: true }
);

supportTicketSchema.index({ submittedBy: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1, priority: 1 });
supportTicketSchema.index({ 'sla.dueAt': 1, 'sla.breached': 1 });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
