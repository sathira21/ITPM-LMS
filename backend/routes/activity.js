const express = require('express');
const router = express.Router();
const { getLogs, getSummary, clearLogs } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, getLogs);
router.get('/summary', protect, authorize('admin'), getSummary);
router.delete('/clear', protect, authorize('admin'), clearLogs);

module.exports = router;
