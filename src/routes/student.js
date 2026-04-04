const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getMyAttendance,
  getAttendanceSummary,
} = require('../controllers/studentController');

// All student routes require authentication + student role
router.use(authenticate);
router.use(authorize('student'));

// Get own attendance (with optional month/year filters)
router.get('/attendance', getMyAttendance);

// Get yearly attendance summary with monthly breakdown
router.get('/attendance/summary', getAttendanceSummary);

module.exports = router;