const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const logActivity = async (userId, action, category, details, req, status = 'success') => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      category,
      details,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
      status,
    });
  } catch {}
};

// @desc   Register user — admin creates (auto-approved, gets token)
// @route  POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, studentId, grade, subjects, relationship } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({
      name, email, password, role: role || 'student',
      phone, studentId, grade, subjects, relationship,
      isApproved: true, registrationType: 'admin',
    });
    await logActivity(user._id, 'REGISTER', 'auth', `New ${user.role} registered: ${user.email}`, req);
    res.status(201).json({ success: true, token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Public self-registration — pending admin approval
// @route  POST /api/auth/public-register
exports.publicRegister = async (req, res) => {
  try {
    const { name, email, password, role, phone, studentId, grade, subjects, relationship } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (!['teacher', 'student', 'guardian'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Choose teacher, student, or guardian.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name, email, password,
      role,
      phone: phone || '',
      studentId: studentId || '',
      grade: grade || '',
      subjects: subjects || [],
      relationship: relationship || '',
      isApproved: false,
      registrationType: 'self',
    });

    await logActivity(user._id, 'SELF_REGISTER', 'auth', `Self-registration request: ${user.email} (${user.role})`, req);
    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully! An admin will review and approve your account.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Login
// @route  POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      await logActivity(null, 'LOGIN_FAILED', 'auth', `Failed login attempt for: ${email}`, req, 'failed');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    if (user.isApproved === false) {
      return res.status(403).json({ success: false, message: 'Your account is pending admin approval. You will be notified once approved.', pendingApproval: true });
    }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    await logActivity(user._id, 'LOGIN', 'auth', `User logged in: ${user.email}`, req);
    res.json({
      success: true,
      token: generateToken(user._id),
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Get current user
// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc   Update profile
// @route  PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, grade, subjects } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, grade, subjects },
      { new: true, runValidators: true }
    );
    await logActivity(req.user._id, 'UPDATE_PROFILE', 'user', 'Profile updated', req);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc   Change password
// @route  PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    await logActivity(req.user._id, 'CHANGE_PASSWORD', 'auth', 'Password changed', req);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
