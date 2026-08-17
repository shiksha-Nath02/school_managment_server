const express = require('express');
const router = express.Router();
const { User, Class } = require('../models');
const upload = require('../middlewares/upload');
const { getTeacherStudentDocs, teacherUploadDocument, deleteDocument } = require('../controllers/documentController');
const {
  getMyClasses,
  getStudentsByClass,
  updateClassStudent,
  addClassStudent,
  getMyProfile,
  getMyStudents,
  submitAttendance,
  getAttendanceByDate,
  getMyAttendanceRecords,
  selfCheckIn,
  selfCheckOut,
} = require('../controllers/teacherController');
const timetableController = require('../controllers/timetableController');
const classTaskController = require('../controllers/classTaskController');
const marksController = require('../controllers/marksController');
const selfAttendanceSettings = require('../utils/selfAttendanceSettings');

const requireSelfAttendanceEnabled = (req, res, next) => {
  const today = new Date().toISOString().split('T')[0];
  if (!selfAttendanceSettings.isEnabled(today)) {
    return res.status(403).json({ message: 'Self check-in is not enabled today. Admin manages attendance.' });
  }
  next();
};

// req.user is set by the authenticate middleware mounted in app.js.

router.get('/profile', getMyProfile);
router.get('/classes', getMyClasses);
router.get('/students/:classId', getStudentsByClass);
router.post('/students', addClassStudent); // add a student to own class (gated by can_edit_students)
router.put('/students/:id', updateClassStudent); // edit a student (gated by can_edit_students + own class)
router.post('/attendance', submitAttendance);
router.get('/attendance/:classId', getAttendanceByDate);
router.get('/my-attendance', getMyAttendanceRecords);
// Read-only: lets a teacher know if self check-in is enabled today (the admin
// toggle lives under /admin, which teachers can't read).
router.get('/self-attendance-setting', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  res.json({ date: today, enabled: selfAttendanceSettings.isEnabled(today) });
});
router.post('/self-checkin', requireSelfAttendanceEnabled, selfCheckIn);
router.post('/self-checkout', requireSelfAttendanceEnabled, selfCheckOut);

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

// Students list
router.get('/my-students', getMyStudents);

// Student documents (class-restricted)
router.get('/student-docs', getTeacherStudentDocs);
router.post('/student-docs/:studentId/:docType', upload.single('file'), teacherUploadDocument);
router.delete('/student-docs/:docId', deleteDocument);

// Marks — specific paths before param route
router.get('/marks/subjects/:classId', marksController.getSubjectsForClass);
router.get('/marks/exam-types/:classId', marksController.getExamTypes);
router.get('/marks/:classId', marksController.getMarks);
router.post('/marks', marksController.saveMarks);
router.delete('/marks', marksController.deleteMarks);

module.exports = router;
