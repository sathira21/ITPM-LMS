const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student', 'guardian'],
      default: 'student',
    },
    avatar: { type: String, default: '' },
    phone: {
      type: String,
      default: '',
      validate: {
        validator: function(v) {
          return !v || /^\d{10}$/.test(v);
        },
        message: 'Phone number must be exactly 10 digits'
      }
    },
    address: { type: String, default: '' },
    isActive:         { type: Boolean, default: true },
    isApproved:       { type: Boolean, default: true },   // false = waiting admin approval
    approvedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt:       { type: Date, default: null },
    rejectionReason:  { type: String, default: '' },
    registrationType: { type: String, enum: ['self', 'admin'], default: 'admin' },
    // Student-specific
    studentId: { type: String, default: '' },
    grade: { type: String, default: '' },
    // Teacher-specific
    subjects: [{ type: String }],
    // Guardian-specific
    relationship: { type: String, default: '' }, // Father, Mother, etc.
    // Timestamps for last activity
    lastLogin: { type: Date },
    lastSeen: { type: Date },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
