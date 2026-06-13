const router = require('express').Router();
const {
  addStudent, getStudents, getStudentById, updateStudent, removeStudent, getClasses,
  getStudentAttendance, getStudentMarks, getStudentFees, getStudentInventory,
  getTeacherAttendanceById, getTeacherClassesById,
  verifyTeacherAttendance,
  getAllTeachers, addTeacher, updateTeacher, removeTeacher,
  getTeacherAttendance, submitTeacherAttendance,
  checkInTeacher, checkOutTeacher, markTeacherStatus,
  updateTeacherAttendance, bulkMarkAbsent, getTeacherAttendanceSummary,
  getSelfAttendanceSetting, toggleSelfAttendance,
} = require('../controllers/adminController');
const { getDashboard } = require('../controllers/dashboardController');

router.get('/dashboard', getDashboard);
router.get('/classes', getClasses);

// Self-attendance settings
router.get('/settings/self-attendance', getSelfAttendanceSetting);
router.post('/settings/self-attendance', toggleSelfAttendance);

// Students
router.post('/students', addStudent);
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', removeStudent);

// Student profile sub-routes
router.get('/students/:id/attendance', getStudentAttendance);
router.get('/students/:id/marks', getStudentMarks);
router.get('/students/:id/fees', getStudentFees);
router.get('/students/:id/inventory', getStudentInventory);

// Teachers
router.get('/teachers', getAllTeachers);
router.post('/teachers', addTeacher);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', removeTeacher);

// Teacher profile sub-routes
router.get('/teachers/:id/attendance', getTeacherAttendanceById);
router.get('/teachers/:id/classes', getTeacherClassesById);

// Teacher attendance — specific paths before :id
router.get('/teacher-attendance/summary', getTeacherAttendanceSummary);
router.get('/teacher-attendance', getTeacherAttendance);
router.post('/teacher-attendance', submitTeacherAttendance);
router.post('/teacher-attendance/check-in', checkInTeacher);
router.post('/teacher-attendance/check-out', checkOutTeacher);
router.post('/teacher-attendance/mark-status', markTeacherStatus);
router.post('/teacher-attendance/bulk-absent', bulkMarkAbsent);
router.put('/teacher-attendance/:id', updateTeacherAttendance);
router.post('/teacher-attendance/:id/verify', verifyTeacherAttendance);

module.exports = router;
