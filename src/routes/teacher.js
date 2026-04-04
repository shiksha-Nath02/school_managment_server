const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getMyClasses,
  getStudentsByClass,
  submitAttendance,
  getAttendanceByDate,
} = require('../controllers/teacherController');

// All teacher routes require authentication + teacher role
router.use(authenticate);
router.use(authorize('teacher'));

// Classes assigned to this teacher
router.get('/classes', getMyClasses);

// Students in a specific class
router.get('/students/:classId', getStudentsByClass);

// Submit or update attendance
router.post('/attendance', submitAttendance);

// Check existing attendance for a class on a date
router.get('/attendance/:classId', getAttendanceByDate);

module.exports = router;