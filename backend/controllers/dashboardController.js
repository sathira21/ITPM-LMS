const User = require('../models/User');
const Report = require('../models/Report');
const LearningGroup = require('../models/LearningGroup');
const ActivityLog = require('../models/ActivityLog');
const GuardianStudentLink = require('../models/GuardianStudentLink');

// @route  GET /api/dashboard/admin
exports.adminDashboard = async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalTeachers, totalGuardians, totalReports, totalGroups, recentActivity] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'teacher', isActive: true }),
      User.countDocuments({ role: 'guardian', isActive: true }),
      Report.countDocuments(),
      LearningGroup.countDocuments({ isActive: true }),
      ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name email role avatar'),
    ]);

    // Monthly user registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalStudents, totalTeachers, totalGuardians, totalReports, totalGroups },
      recentActivity,
      monthlyRegistrations,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/dashboard/student
exports.studentDashboard = async (req, res) => {
  try {
    const [reports, groups, recentActivity] = await Promise.all([
      Report.find({ student: req.user._id, status: 'published' }).sort({ createdAt: -1 }).limit(5),
      LearningGroup.find({ 'members.user': req.user._id, isActive: true }).limit(5),
      ActivityLog.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(8),
    ]);
    const latestReport = reports[0] || null;
    res.json({ success: true, reports, groups, recentActivity, latestReport, user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/dashboard/teacher
exports.teacherDashboard = async (req, res) => {
  try {
    const [totalStudents, totalReports, groups, recentActivity] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      Report.countDocuments({ generatedBy: req.user._id }),
      LearningGroup.find({ createdBy: req.user._id, isActive: true }),
      ActivityLog.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(8),
    ]);
    res.json({ success: true, stats: { totalStudents, totalReports, totalGroups: groups.length }, groups, recentActivity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/dashboard/guardian
exports.guardianDashboard = async (req, res) => {
  try {
    const links = await GuardianStudentLink.find({ guardian: req.user._id, isActive: true })
      .populate('student', 'name email studentId grade avatar');
    const studentIds = links.map((l) => l.student._id);
    const reports = await Report.find({ student: { $in: studentIds }, status: 'published' })
      .populate('student', 'name studentId grade')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ success: true, linkedStudents: links, recentReports: reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
