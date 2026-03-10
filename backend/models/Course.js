const mongoose = require('mongoose');

// Module/Week schema (embedded in Course)
const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 0 },
  materials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }],
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

// Main Course schema
const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true }, // e.g., "CS101"
    description: { type: String, default: '' },
    thumbnail: { type: String, default: '' },

    // Course details
    category: { type: String, default: '' }, // e.g., "Computer Science", "Mathematics"
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    duration: { type: String, default: '' }, // e.g., "12 weeks", "1 semester"
    credits: { type: Number, default: 0 },

    // Academic info
    academicYear: { type: String, default: '' },
    semester: { type: String, default: '' },

    // Modules/Weeks
    modules: [moduleSchema],

    // Instructors (teachers)
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Enrolled students
    enrolledStudents: [{
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      enrolledAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
    }],

    // Settings
    maxStudents: { type: Number, default: 0 }, // 0 = unlimited
    enrollmentOpen: { type: Boolean, default: true },

    // Status
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },

    // Ownership
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },

    // Tags for search
    tags: [{ type: String, lowercase: true, trim: true }],
  },
  { timestamps: true }
);

// Indexes
courseSchema.index({ code: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ 'enrolledStudents.student': 1 });
courseSchema.index({ instructors: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ tags: 1 });

// Virtual for enrolled count
courseSchema.virtual('enrolledCount').get(function() {
  return this.enrolledStudents?.filter(e => e.status === 'active').length || 0;
});

// Virtual for module count
courseSchema.virtual('moduleCount').get(function() {
  return this.modules?.length || 0;
});

// Ensure virtuals are included in JSON
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
