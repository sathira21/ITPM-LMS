const express = require('express');
const router = express.Router();
const {
  getQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz,
  publishQuiz, submitAttempt, getAttempts, getAnalytics, getMyAttempts,
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/my-attempts',     protect, authorize('student'), getMyAttempts);
router.get('/',                protect, getQuizzes);
router.get('/:id',             protect, getQuiz);
router.post('/',               protect, authorize('admin', 'teacher'), createQuiz);
router.put('/:id',             protect, authorize('admin', 'teacher'), updateQuiz);
router.delete('/:id',          protect, authorize('admin', 'teacher'), deleteQuiz);
router.put('/:id/publish',     protect, authorize('admin', 'teacher'), publishQuiz);
router.post('/:id/attempt',    protect, authorize('student'), submitAttempt);
router.get('/:id/attempts',    protect, getAttempts);
router.get('/:id/analytics',   protect, authorize('admin', 'teacher'), getAnalytics);

module.exports = router;
