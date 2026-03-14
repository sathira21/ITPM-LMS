const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const {
  getTickets, getTicketById, getStats, createTicket,
  addReply, updateStatus, rateSatisfaction, deleteTicket,
} = require('../controllers/supportTicketController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Multer config for ticket attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads', 'tickets')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'text/csv',
    'application/zip', 'application/x-rar-compressed',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('File type not allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB

router.get('/stats',         protect, authorize('admin'), getStats);
router.get('/',              protect, getTickets);
router.get('/:id',           protect, getTicketById);
router.post('/',             protect, authorize('student'), upload.array('attachments', 5), createTicket);
router.put('/:id/reply',     protect, upload.array('attachments', 5), addReply);
router.put('/:id/status',    protect, authorize('admin'), updateStatus);
router.put('/:id/rate',      protect, rateSatisfaction);
router.delete('/:id',        protect, deleteTicket);

module.exports = router;
