const express = require('express');
const router = express.Router();
const {
  // Student endpoints
  startProgress,
  heartbeat,
  endSession,
  markComplete,
  unmarkComplete,
  getMyProgress,
  getMyMaterialProgress,
  // Student course progress
  getMyCourseProgress,
  getMyCourseDetailProgress,
  // Admin/Teacher analytics
  getAnalyticsOverview,
  getStudentAnalytics,
  getStudentDetailedProgress,
  getMaterialAnalytics,
  getMaterialDetailedAnalytics,
  getProgressMatrix,
  exportProgressData,
  // Course analytics
  getCourseAnalytics,
  getCourseDetailedAnalytics,
} = require('../controllers/progressController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// ─── Student Progress Tracking ───
router.post('/start/:materialId', protect, authorize('student'), startProgress);
router.put('/heartbeat/:materialId', protect, authorize('student'), heartbeat);
router.put('/end/:materialId', protect, authorize('student'), endSession);
router.put('/complete/:materialId', protect, authorize('student'), markComplete);
router.put('/uncomplete/:materialId', protect, authorize('student'), unmarkComplete);
router.get('/my', protect, authorize('student'), getMyProgress);
router.get('/my/:materialId', protect, authorize('student'), getMyMaterialProgress);

// ─── Student Course Progress ───
router.get('/courses/my', protect, authorize('student'), getMyCourseProgress);
router.get('/courses/:courseId', protect, authorize('student'), getMyCourseDetailProgress);

// ─── Admin/Teacher Analytics ───
router.get('/analytics/overview', protect, authorize('admin', 'teacher'), getAnalyticsOverview);
router.get('/analytics/students', protect, authorize('admin', 'teacher'), getStudentAnalytics);
router.get('/analytics/students/:studentId', protect, authorize('admin', 'teacher'), getStudentDetailedProgress);
router.get('/analytics/materials', protect, authorize('admin', 'teacher'), getMaterialAnalytics);
router.get('/analytics/materials/:materialId', protect, authorize('admin', 'teacher'), getMaterialDetailedAnalytics);
router.get('/analytics/matrix', protect, authorize('admin', 'teacher'), getProgressMatrix);
router.get('/analytics/export', protect, authorize('admin'), exportProgressData);

// ─── Course Analytics ───
router.get('/analytics/courses', protect, authorize('admin', 'teacher'), getCourseAnalytics);
router.get('/analytics/courses/:courseId', protect, authorize('admin', 'teacher'), getCourseDetailedAnalytics);

module.exports = router;
