const router = require('express').Router();
const {
  addStudent, getStudents, getStudentById, getClasses,
  getAllTeachers,
  getTeacherAttendance, submitTeacherAttendance,
  checkInTeacher, checkOutTeacher, markTeacherStatus,
  updateTeacherAttendance, bulkMarkAbsent, getTeacherAttendanceSummary,
} = require('../controllers/adminController');

router.get('/classes', getClasses);
router.post('/students', addStudent);
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);
router.get('/teachers', getAllTeachers);

// Teacher attendance — specific paths before :id
router.get('/teacher-attendance/summary', getTeacherAttendanceSummary);
router.get('/teacher-attendance', getTeacherAttendance);
router.post('/teacher-attendance', submitTeacherAttendance);
router.post('/teacher-attendance/check-in', checkInTeacher);
router.post('/teacher-attendance/check-out', checkOutTeacher);
router.post('/teacher-attendance/mark-status', markTeacherStatus);
router.post('/teacher-attendance/bulk-absent', bulkMarkAbsent);
router.put('/teacher-attendance/:id', updateTeacherAttendance);

module.exports = router;
