const Report = require('../models/Report');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const GuardianStudentLink = require('../models/GuardianStudentLink');

const logActivity = async (userId, action, details, req) => {
  try {
    await ActivityLog.create({ user: userId, action, category: 'report', details, ipAddress: req.ip });
  } catch {}
};

// @route  GET /api/reports
exports.getReports = async (req, res) => {
  try {
    const { studentId, status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (req.user.role === 'student') query.student = req.user._id;
    else if (studentId) query.student = studentId;
    if (status) query.status = status;

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('student', 'name studentId grade email')
      .populate('generatedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, reports, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/reports/:id
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('student', 'name studentId grade email phone avatar')
      .populate('generatedBy', 'name email');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    // Access control: student can only see own, guardian only linked students
    if (req.user.role === 'student' && report.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (req.user.role === 'guardian') {
      const link = await GuardianStudentLink.findOne({ guardian: req.user._id, student: report.student._id, isActive: true });
      if (!link || !link.permissions.viewReports) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }
    await logActivity(req.user._id, 'VIEW_REPORT', `Viewed report: ${report.title}`, req);
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/reports
exports.createReport = async (req, res) => {
  try {
    const { studentId, title, period, academicYear, grades, attendance, teacherRemarks, overallGrade, gpa } = req.body;
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ success: false, message: 'Student not found' });
    }
    const report = await Report.create({
      student: studentId, generatedBy: req.user._id,
      title, period, academicYear, grades, attendance,
      teacherRemarks, overallGrade, gpa,
    });
    await report.populate([
      { path: 'student', select: 'name studentId grade' },
      { path: 'generatedBy', select: 'name email' },
    ]);
    await logActivity(req.user._id, 'CREATE_REPORT', `Created report: ${title} for ${student.name}`, req);
    res.status(201).json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/reports/:id
exports.updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('student', 'name studentId grade');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/reports/:id
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/reports/:id/publish
exports.publishReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, { status: 'published' }, { new: true });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    await logActivity(req.user._id, 'PUBLISH_REPORT', `Published report: ${report.title}`, req);
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
