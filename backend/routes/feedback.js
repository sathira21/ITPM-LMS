const express = require('express');
const router = express.Router();
const {
  getFeedbacks, getStats, submitFeedback,
  respondToFeedback, updateStatus, deleteFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/stats',       protect, authorize('admin'), getStats);
router.get('/',            protect, getFeedbacks);
router.post('/',           protect, authorize('student', 'teacher'), submitFeedback);
router.put('/:id/respond', protect, authorize('admin'), respondToFeedback);
router.put('/:id/status',  protect, authorize('admin'), updateStatus);
router.delete('/:id',      protect, deleteFeedback);

module.exports = router;
