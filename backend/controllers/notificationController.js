const User                 = require('../models/User');
const Report               = require('../models/Report');
const Feedback             = require('../models/Feedback');
const ProgressNotification = require('../models/ProgressNotification');
const GuardianStudentLink  = require('../models/GuardianStudentLink');
const QuizAttempt          = require('../models/QuizAttempt');

const DAY  = 86400000;
const WEEK = 7 * DAY;

function ago(ms) { return new Date(Date.now() - ms); }

/* ── Unified notifications per role ── */
exports.getNotifications = async (req, res) => {
  try {
    const { role, _id: userId } = req.user;
    const items = [];

    /* ════════════════ ADMIN ════════════════ */
    if (role === 'admin') {
      // Pending registrations
      const pending = await User.countDocuments({ isApproved: false });
      if (pending > 0) {
        items.push({
          id: 'pending-approvals',
          type: 'pending_approval',
          title: `${pending} Pending Registration${pending > 1 ? 's' : ''}`,
          message: `${pending} user${pending > 1 ? 's are' : ' is'} waiting for your approval.`,
          severity: 'warning',
          link: '/dashboard/users',
          createdAt: new Date(),
          pinned: true,
        });
      }

      // New feedback (last 7 days, still pending)
      const feedbackCount = await Feedback.countDocuments({
        status: 'pending',
        createdAt: { $gte: ago(WEEK) },
      });
      if (feedbackCount > 0) {
        items.push({
          id: 'new-feedback',
          type: 'feedback',
          title: `${feedbackCount} Unreviewed Feedback`,
          message: `${feedbackCount} feedback submission${feedbackCount > 1 ? 's' : ''} need your attention.`,
          severity: 'info',
          link: '/dashboard/feedback',
          createdAt: ago(1000),
        });
      }

      // Recently approved registrations (last 24h)
      const recentApprovals = await User.find({
        isApproved: true,
        registrationType: 'self',
        approvedAt: { $gte: ago(DAY) },
      }).select('name role approvedAt').limit(3);
      for (const u of recentApprovals) {
        items.push({
          id: `approved-${u._id}`,
          type: 'user_approved',
          title: 'Registration Approved',
          message: `${u.name} (${u.role}) was approved and can now log in.`,
          severity: 'success',
          link: '/dashboard/users',
          createdAt: u.approvedAt || ago(DAY),
        });
      }
    }

    /* ════════════════ TEACHER ════════════════ */
    if (role === 'teacher') {
      // New pending feedback (last 7 days)
      const feedbackCount = await Feedback.countDocuments({
        status: 'pending',
        createdAt: { $gte: ago(WEEK) },
      });
      if (feedbackCount > 0) {
        items.push({
          id: 'teacher-feedback',
          type: 'feedback',
          title: `${feedbackCount} New Feedback`,
          message: `Students submitted ${feedbackCount} feedback item${feedbackCount > 1 ? 's' : ''} recently.`,
          severity: 'info',
          link: '/dashboard/feedback',
          createdAt: ago(1000),
        });
      }

      // Quiz attempts in last 24h
      const attemptCount = await QuizAttempt.countDocuments({
        submittedAt: { $gte: ago(DAY) },
      });
      if (attemptCount > 0) {
        items.push({
          id: 'quiz-attempts',
          type: 'quiz_attempt',
          title: `${attemptCount} Quiz Submission${attemptCount > 1 ? 's' : ''}`,
          message: `${attemptCount} student${attemptCount > 1 ? 's' : ''} submitted quiz attempt${attemptCount > 1 ? 's' : ''} today.`,
          severity: 'info',
          link: '/dashboard/quiz',
          createdAt: ago(2000),
        });
      }

      // Students with progress drops (last 24h)
      const drops = await ProgressNotification.find({
        type: 'progress_drop',
        createdAt: { $gte: ago(DAY) },
      }).populate('student', 'name').limit(5);
      for (const d of drops) {
        if (!d.student) continue;
        items.push({
          id: `drop-${d._id}`,
          type: 'progress_drop',
          title: 'Student Progress Alert',
          message: `${d.student.name}'s progress dropped ${d.dropPercent || ''}% — consider checking in.`,
          severity: 'warning',
          link: '/dashboard/progress',
          createdAt: d.createdAt,
        });
      }
    }

    /* ════════════════ STUDENT ════════════════ */
    if (role === 'student') {
      // Progress notifications (unread)
      const progNotifs = await ProgressNotification.find({
        student: userId,
        isRead: false,
      }).sort({ createdAt: -1 }).limit(10);

      for (const n of progNotifs) {
        items.push({
          id: n._id.toString(),
          type: n.type,
          title: n.title,
          message: n.message,
          severity: n.severity,
          link: '/dashboard/progress',
          createdAt: n.createdAt,
          isProgNotif: true,
        });
      }

      // Newly published reports (last 7 days)
      const newReports = await Report.find({
        student: userId,
        status: 'published',
        createdAt: { $gte: ago(WEEK) },
      }).select('title createdAt').sort({ createdAt: -1 }).limit(3);

      for (const r of newReports) {
        items.push({
          id: `report-${r._id}`,
          type: 'new_report',
          title: 'New Report Published',
          message: `"${r.title}" is now available for you to view.`,
          severity: 'info',
          link: '/dashboard/reports',
          createdAt: r.createdAt,
        });
      }
    }

    /* ════════════════ GUARDIAN ════════════════ */
    if (role === 'guardian') {
      // Linked students
      const links = await GuardianStudentLink.find({ guardian: userId, isActive: true }).select('student');
      const studentIds = links.map(l => l.student);

      if (studentIds.length > 0) {
        // New published reports for linked students
        const newReports = await Report.find({
          student: { $in: studentIds },
          status: 'published',
          createdAt: { $gte: ago(WEEK) },
        }).populate('student', 'name').sort({ createdAt: -1 }).limit(5);

        for (const r of newReports) {
          items.push({
            id: `guardian-report-${r._id}`,
            type: 'new_report',
            title: 'New Report for Your Child',
            message: `${r.student?.name}'s report "${r.title}" has been published.`,
            severity: 'info',
            link: '/dashboard/reports',
            createdAt: r.createdAt,
          });
        }

        // Progress drops for linked students (last 48h)
        const drops = await ProgressNotification.find({
          student: { $in: studentIds },
          type: 'progress_drop',
          createdAt: { $gte: ago(2 * DAY) },
        }).populate('student', 'name').sort({ createdAt: -1 }).limit(5);

        for (const d of drops) {
          if (!d.student) continue;
          items.push({
            id: `guardian-drop-${d._id}`,
            type: 'progress_drop',
            title: 'Progress Alert',
            message: `${d.student.name}'s learning progress has declined. Check their progress tracker.`,
            severity: 'warning',
            link: '/dashboard/progress',
            createdAt: d.createdAt,
          });
        }

        // Milestones achieved by linked students (last 7 days)
        const milestones = await ProgressNotification.find({
          student: { $in: studentIds },
          type: 'milestone',
          createdAt: { $gte: ago(WEEK) },
        }).populate('student', 'name').sort({ createdAt: -1 }).limit(3);

        for (const m of milestones) {
          if (!m.student) continue;
          items.push({
            id: `guardian-milestone-${m._id}`,
            type: 'milestone',
            title: `${m.student.name} Achieved a Milestone!`,
            message: m.message,
            severity: 'success',
            link: '/dashboard/progress',
            createdAt: m.createdAt,
          });
        }
      } else {
        items.push({
          id: 'no-links',
          type: 'info',
          title: 'No Students Linked',
          message: 'Ask an admin to link you to your child\'s account to receive updates.',
          severity: 'info',
          link: '/dashboard',
          createdAt: new Date(),
        });
      }
    }

    // Sort: pinned first, then by date desc
    items.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({ notifications: items.slice(0, 20) });
  } catch (err) {
    console.error('getNotifications error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

/* ── Mark progress notifications read (student/guardian) ── */
exports.markRead = async (req, res) => {
  try {
    const { _id: userId, role } = req.user;
    if (role === 'student') {
      await ProgressNotification.updateMany({ student: userId, isRead: false }, { isRead: true });
    }
    if (role === 'guardian') {
      const links = await GuardianStudentLink.find({ guardian: userId, isActive: true }).select('student');
      const ids   = links.map(l => l.student);
      await ProgressNotification.updateMany({ student: { $in: ids }, isRead: false }, { isRead: true });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
