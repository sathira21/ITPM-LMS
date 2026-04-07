const express = require('express');
const router = express.Router();

const {
  getCourses, getMyCourses, getStats, getCourse,
  createCourse, updateCourse, publishCourse, archiveCourse, deleteCourse,
  addModule, updateModule, deleteModule, reorderModules,
  addMaterialToModule, removeMaterialFromModule,
  enrollInCourse, bulkEnroll, unenrollFromCourse, getEnrolledStudents,
  addInstructor, removeInstructor,
} = require('../controllers/courseController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// ─── Course CRUD ───
router.get('/stats',           protect, authorize('admin', 'teacher'), getStats);
router.get('/my',              protect, getMyCourses);
router.get('/',                protect, getCourses);
router.get('/:id',             protect, getCourse);
router.post('/',               protect, authorize('admin', 'teacher'), createCourse);
router.put('/:id',             protect, authorize('admin', 'teacher'), updateCourse);
router.put('/:id/publish',     protect, authorize('admin', 'teacher'), publishCourse);
router.put('/:id/archive',     protect, authorize('admin'), archiveCourse);
router.delete('/:id',          protect, authorize('admin', 'teacher'), deleteCourse);

// ─── Module Management ───
router.post('/:id/modules',              protect, authorize('admin', 'teacher'), addModule);
router.put('/:id/modules/:moduleId',     protect, authorize('admin', 'teacher'), updateModule);
router.delete('/:id/modules/:moduleId',  protect, authorize('admin', 'teacher'), deleteModule);
router.put('/:id/modules/reorder',       protect, authorize('admin', 'teacher'), reorderModules);

// ─── Material within Module ───
router.post('/:id/modules/:moduleId/materials',               protect, authorize('admin', 'teacher'), addMaterialToModule);
router.delete('/:id/modules/:moduleId/materials/:materialId', protect, authorize('admin', 'teacher'), removeMaterialFromModule);

// ─── Enrollment ───
router.post('/:id/enroll',           protect, enrollInCourse);
router.post('/:id/enroll/bulk',      protect, authorize('admin', 'teacher'), bulkEnroll);
router.delete('/:id/enroll',         protect, unenrollFromCourse);
router.get('/:id/students',          protect, authorize('admin', 'teacher'), getEnrolledStudents);

// ─── Instructors ───
router.post('/:id/instructors',              protect, authorize('admin'), addInstructor);
router.delete('/:id/instructors/:instructorId', protect, authorize('admin'), removeInstructor);

module.exports = router;
