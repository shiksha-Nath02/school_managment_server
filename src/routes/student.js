const express = require('express');
const router = express.Router();
const { User } = require('../models');
const {
  getMyAttendance,
  getAttendanceSummary,
  getMyProfile,
} = require('../controllers/studentController');
const timetableController = require('../controllers/timetableController');
const classTaskController = require('../controllers/classTaskController');
const feeController = require('../controllers/feeController');
const marksController = require('../controllers/marksController');

// req.user is set by the authenticate middleware mounted in app.js.

// Profile (personal info + headline stats)
router.get('/profile', getMyProfile);

router.get('/attendance', getMyAttendance);
router.get('/attendance/summary', getAttendanceSummary);

// Timetable
router.get('/timetable', timetableController.getStudentTimetable);

// Classwork/Homework — specific path before param route
router.get('/class-tasks/week', classTaskController.getStudentWeekTasks);
router.get('/class-tasks', classTaskController.getStudentClassTasks);

// Fee history
router.get('/fee-history', feeController.getMyFeeHistory);

// Results
router.get('/results', marksController.getOwnResults);

module.exports = router;
