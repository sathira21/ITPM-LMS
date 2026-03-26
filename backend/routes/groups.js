const express = require('express');
const router = express.Router();
const { getGroups, getGroup, createGroup, joinGroup, leaveGroup, updateGroup, deleteGroup } = require('../controllers/groupController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, getGroups);
router.get('/:id', protect, getGroup);
router.post('/', protect, authorize('admin', 'teacher', 'student'), createGroup);
router.post('/:id/join', protect, authorize('student', 'teacher'), joinGroup);
router.post('/:id/leave', protect, leaveGroup);
router.put('/:id', protect, updateGroup);
router.delete('/:id', protect, authorize('admin', 'teacher'), deleteGroup);

module.exports = router;
