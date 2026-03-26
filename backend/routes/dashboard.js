const express = require('express');
const router = express.Router();
const { adminDashboard, studentDashboard, teacherDashboard, guardianDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/admin', protect, authorize('admin'), adminDashboard);
router.get('/student', protect, authorize('student'), studentDashboard);
router.get('/teacher', protect, authorize('teacher'), teacherDashboard);
router.get('/guardian', protect, authorize('guardian'), guardianDashboard);

module.exports = router;
