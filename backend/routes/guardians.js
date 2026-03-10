const express = require('express');
const router = express.Router();
const { getLinks, createLink, updateLink, deleteLink, getMyStudents, getStudentOverview } = require('../controllers/guardianController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/links', protect, authorize('admin', 'teacher'), getLinks);
router.post('/link', protect, authorize('admin'), createLink);
router.put('/link/:id', protect, authorize('admin'), updateLink);
router.delete('/link/:id', protect, authorize('admin'), deleteLink);
router.get('/my-students', protect, authorize('guardian'), getMyStudents);
router.get('/student-overview/:studentId', protect, authorize('guardian'), getStudentOverview);

module.exports = router;
