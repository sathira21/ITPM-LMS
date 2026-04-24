const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const {
  getMaterials, getMaterial, uploadMaterial, createUrlMaterial, updateMaterial,
  approveMaterial, archiveMaterial, restoreMaterial,
  downloadMaterial, deleteMaterial, getStats,
} = require('../controllers/materialController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Multer config — disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'materials')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm',
    'text/plain',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('File type not allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }); // 50 MB

// Routes
router.get('/stats',                 protect, authorize('admin', 'teacher'), getStats);
router.get('/',                      protect, getMaterials);
router.get('/:id',                   protect, getMaterial);
router.get('/:id/download',          protect, downloadMaterial);
router.post('/',                     protect, authorize('admin', 'teacher'), upload.single('file'), uploadMaterial);
router.post('/url',                  protect, authorize('admin', 'teacher'), createUrlMaterial);
router.put('/:id',                   protect, authorize('admin', 'teacher'), updateMaterial);
router.put('/:id/approve',           protect, authorize('admin'), approveMaterial);
router.put('/:id/archive',           protect, authorize('admin'), archiveMaterial);
router.put('/:id/restore',           protect, authorize('admin'), restoreMaterial);
router.delete('/:id',                protect, authorize('admin', 'teacher'), deleteMaterial);

module.exports = router;
