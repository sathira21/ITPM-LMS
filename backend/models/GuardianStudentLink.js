const mongoose = require('mongoose');

const guardianStudentLinkSchema = new mongoose.Schema(
  {
    guardian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    relationship: {
      type: String,
      enum: ['Father', 'Mother', 'Uncle', 'Aunt', 'Sibling', 'Legal Guardian', 'Other'],
      default: 'Father',
    },
    permissions: {
      viewGrades: { type: Boolean, default: true },
      viewAttendance: { type: Boolean, default: true },
      viewReports: { type: Boolean, default: true },
      viewActivity: { type: Boolean, default: false },
    },
    linkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One guardian can be linked to multiple students, but not the same student twice
guardianStudentLinkSchema.index({ guardian: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('GuardianStudentLink', guardianStudentLinkSchema);
