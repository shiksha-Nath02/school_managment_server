const express = require('express');
const router = express.Router();
const { User } = require('../models');
const {
  getMyClasses,
  getStudentsByClass,
  submitAttendance,
  getAttendanceByDate,
  getMyAttendanceRecords,
} = require('../controllers/teacherController');

// Dev bypass: inject first teacher user so controllers can use req.user.id
router.use(async (req, res, next) => {
  try {
    req.user = await User.findOne({ where: { role: 'teacher' } });
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/classes', getMyClasses);
router.get('/students/:classId', getStudentsByClass);
router.post('/attendance', submitAttendance);
router.get('/attendance/:classId', getAttendanceByDate);
router.get('/my-attendance', getMyAttendanceRecords);

module.exports = router;
