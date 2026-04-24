const GuardianStudentLink = require('../models/GuardianStudentLink');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Report = require('../models/Report');

const logActivity = async (userId, action, category, details, req) => {
  try {
    await ActivityLog.create({ user: userId, action, category, details, ipAddress: req.ip });
  } catch {}
};

// @route  GET /api/guardians/links
exports.getLinks = async (req, res) => {
  try {
    const { guardianId, studentId } = req.query;
    const query = {};
    if (guardianId) query.guardian = guardianId;
    if (studentId) query.student = studentId;
    const links = await GuardianStudentLink.find(query)
      .populate('guardian', 'name email phone role avatar relationship')
      .populate('student', 'name email studentId grade avatar')
      .populate('linkedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, links });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/guardians/link
exports.createLink = async (req, res) => {
  try {
    const { guardianId, studentId, relationship, permissions } = req.body;
    const [guardian, student] = await Promise.all([
      User.findById(guardianId),
      User.findById(studentId),
    ]);
    if (!guardian || guardian.role !== 'guardian') {
      return res.status(400).json({ success: false, message: 'Guardian not found or invalid role' });
    }
    if (!student || student.role !== 'student') {
      return res.status(400).json({ success: false, message: 'Student not found or invalid role' });
    }
    const existing = await GuardianStudentLink.findOne({ guardian: guardianId, student: studentId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Link already exists' });
    }
    const link = await GuardianStudentLink.create({
      guardian: guardianId,
      student: studentId,
      relationship: relationship || 'Father',
      permissions,
      linkedBy: req.user._id,
    });
    await link.populate([
      { path: 'guardian', select: 'name email role' },
      { path: 'student', select: 'name email studentId grade' },
    ]);
    await logActivity(req.user._id, 'CREATE_GUARDIAN_LINK', 'guardian', `Linked guardian ${guardian.name} to student ${student.name}`, req);
    res.status(201).json({ success: true, link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/guardians/link/:id
exports.updateLink = async (req, res) => {
  try {
    const link = await GuardianStudentLink.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('guardian', 'name email')
      .populate('student', 'name email studentId grade');
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    res.json({ success: true, link });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/guardians/link/:id
exports.deleteLink = async (req, res) => {
  try {
    const link = await GuardianStudentLink.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ success: false, message: 'Link not found' });
    await logActivity(req.user._id, 'DELETE_GUARDIAN_LINK', 'guardian', 'Guardian-student link removed', req);
    res.json({ success: true, message: 'Link removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/guardians/my-students  (for guardians)
exports.getMyStudents = async (req, res) => {
  try {
    const links = await GuardianStudentLink.find({ guardian: req.user._id, isActive: true })
      .populate('student', 'name email studentId grade avatar phone');
    const students = links.map((l) => ({ ...l.student.toObject(), permissions: l.permissions, relationship: l.relationship, linkId: l._id }));
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/guardians/student-overview/:studentId  (guardian sees student data)
exports.getStudentOverview = async (req, res) => {
  try {
    const link = await GuardianStudentLink.findOne({
      guardian: req.user._id,
      student: req.params.studentId,
      isActive: true,
    });
    if (!link) return res.status(403).json({ success: false, message: 'No access to this student' });
    const student = await User.findById(req.params.studentId).select('-password');
    const reports = link.permissions.viewReports
      ? await Report.find({ student: req.params.studentId, status: 'published' }).sort({ createdAt: -1 }).limit(5)
      : [];
    res.json({ success: true, student, reports, permissions: link.permissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
