const express = require('express');
const router = express.Router();
const { User, Class } = require('../models');
const {
  getMyClasses,
  getStudentsByClass,
  submitAttendance,
  getAttendanceByDate,
  getMyAttendanceRecords,
} = require('../controllers/teacherController');
const timetableController = require('../controllers/timetableController');
const classTaskController = require('../controllers/classTaskController');

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

// All classes dropdown (substitute teacher support — shows all 24 classes)
router.get('/all-classes', async (req, res) => {
  try {
    const classes = await Class.findAll({ order: [['class_name', 'ASC'], ['section', 'ASC']] });
    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch classes' });
  }
});

// Timetable
router.get('/timetable/:classId', timetableController.getTimetable);
router.put('/timetable/:classId', timetableController.updateTimetable);

// Classwork/Homework — specific path before param route
router.get('/class-tasks/form-data/:classId', classTaskController.getFormData);
router.post('/class-tasks', classTaskController.saveClassTasks);

module.exports = router;
