const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const GuardianStudentLink = require('../models/GuardianStudentLink');

const logActivity = async (userId, action, category, details, req) => {
  try {
    await ActivityLog.create({ user: userId, action, category, details, ipAddress: req.ip });
  } catch {}
};

// @route  GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10, isActive } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/users
exports.createUser = async (req, res) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create(req.body);
    await logActivity(req.user._id, 'CREATE_USER', 'user', `Created user: ${user.email} (${user.role})`, req);
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await logActivity(req.user._id, 'UPDATE_USER', 'user', `Updated user: ${user.email}`, req);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Deactivate instead of hard delete
    user.isActive = false;
    await user.save();
    await logActivity(req.user._id, 'DEACTIVATE_USER', 'user', `Deactivated user: ${user.email}`, req);
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/users/:id/toggle-status
exports.toggleStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    await logActivity(req.user._id, user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER', 'user', `${user.isActive ? 'Activated' : 'Deactivated'}: ${user.email}`, req);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/users/stats
exports.getStats = async (req, res) => {
  try {
    const [total, admins, teachers, students, guardians, active, pending] = await Promise.all([
      User.countDocuments({ isApproved: { $ne: false } }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'teacher', isApproved: { $ne: false } }),
      User.countDocuments({ role: 'student', isApproved: { $ne: false } }),
      User.countDocuments({ role: 'guardian', isApproved: { $ne: false } }),
      User.countDocuments({ isActive: true, isApproved: { $ne: false } }),
      User.countDocuments({ isApproved: false }),
    ]);
    res.json({ success: true, stats: { total, admins, teachers, students, guardians, active, inactive: total - active, pending } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/users/pending
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false }).sort({ createdAt: -1 });
    res.json({ success: true, users, total: users.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/users/:id/approve
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isApproved = true;
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    user.rejectionReason = '';
    await user.save();
    await logActivity(req.user._id, 'APPROVE_USER', 'user', `Approved registration: ${user.email} (${user.role})`, req);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/users/:id/reject
exports.rejectUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await logActivity(req.user._id, 'REJECT_USER', 'user', `Rejected registration: ${user.email} — ${reason || 'No reason given'}`, req);
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Registration rejected and removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
