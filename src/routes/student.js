const express = require('express');
const router = express.Router();
const { User } = require('../models');
const {
  getMyAttendance,
  getAttendanceSummary,
} = require('../controllers/studentController');
const timetableController = require('../controllers/timetableController');
const classTaskController = require('../controllers/classTaskController');
const feeController = require('../controllers/feeController');

// Dev bypass: inject first student user so controllers can use req.user.id
router.use(async (req, res, next) => {
  try {
    req.user = await User.findOne({ where: { role: 'student' } });
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/attendance', getMyAttendance);
router.get('/attendance/summary', getAttendanceSummary);

// Timetable
router.get('/timetable', timetableController.getStudentTimetable);

// Classwork/Homework — specific path before param route
router.get('/class-tasks/week', classTaskController.getStudentWeekTasks);
router.get('/class-tasks', classTaskController.getStudentClassTasks);

// Fee history
router.get('/fee-history', feeController.getMyFeeHistory);

module.exports = router;
