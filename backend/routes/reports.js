const express = require('express');
const router = express.Router();
const { getReports, getReport, createReport, updateReport, deleteReport, publishReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, getReports);
router.get('/:id', protect, getReport);
router.post('/', protect, authorize('admin', 'teacher'), createReport);
router.put('/:id', protect, authorize('admin', 'teacher'), updateReport);
router.put('/:id/publish', protect, authorize('admin', 'teacher'), publishReport);
router.delete('/:id', protect, authorize('admin'), deleteReport);

module.exports = router;
