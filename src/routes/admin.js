const router = require('express').Router();
const {
  addStudent, getStudents, getStudentById, updateStudent, removeStudent, getClasses, lookupStudent,
  getStudentAttendance, getStudentMarks, getStudentFees, getStudentInventory,
  getTeacherAttendanceById, getTeacherClassesById,
  verifyTeacherAttendance,
  getAllTeachers, addTeacher, updateTeacher, removeTeacher, setTeacherPermissions, assignTeacherClass,
  getTeacherAttendance, submitTeacherAttendance,
  checkInTeacher, checkOutTeacher, markTeacherStatus,
  updateTeacherAttendance, bulkMarkAbsent, getTeacherAttendanceSummary, getTeacherAttendancePhotos,
  getSelfAttendanceSetting, toggleSelfAttendance,
  resetUserPassword,
  getClassReportCards, getClassAttendanceSummary,
} = require('../controllers/adminController');
const { getDashboard } = require('../controllers/dashboardController');
const { listHolidays, addHoliday, deleteHoliday } = require('../controllers/holidayController');
// Student-attendance marking is shared with the teacher flow — same handlers,
// mounted here so an admin/superadmin can upload attendance for any class.
const {
  getStudentsByClass: getAttendanceStudents,
  getAttendanceByDate: getStudentAttendanceByDate,
  submitAttendance: submitStudentAttendance,
} = require('../controllers/teacherController');
const { authorize } = require('../middlewares/auth');

router.get('/dashboard', getDashboard);
router.get('/classes', getClasses);

// Reset another user's password — super admin only.
router.put('/users/:userId/reset-password', authorize('superadmin'), resetUserPassword);

// Self-attendance settings
router.get('/settings/self-attendance', getSelfAttendanceSetting);
router.post('/settings/self-attendance', toggleSelfAttendance);

// Holidays (school-wide non-working days)
router.get('/holidays', listHolidays);
router.post('/holidays', addHoliday);
router.delete('/holidays/:id', deleteHoliday);

// Academic reports & attendance (class-wide, for the admin Reports/Attendance tabs)
router.get('/report-cards/:classId', getClassReportCards);
router.get('/class-attendance', getClassAttendanceSummary);

// Student-attendance upload (admin can mark any class — same UI as teachers).
router.get('/attendance-students/:classId', getAttendanceStudents);
router.get('/student-attendance/:classId', getStudentAttendanceByDate);
router.post('/student-attendance', submitStudentAttendance);

// Students
router.get('/student-lookup', lookupStudent); // by admission number, for sell forms
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

// Superadmin-only: toggle whether a teacher can edit students in her own class.
router.put('/teachers/:id/permissions', authorize('superadmin'), setTeacherPermissions);

// Assign (or clear) this teacher's class — one class per teacher, steals on conflict.
router.put('/teachers/:id/class', assignTeacherClass);

// Teacher profile sub-routes
router.get('/teachers/:id/attendance', getTeacherAttendanceById);
router.get('/teachers/:id/classes', getTeacherClassesById);

// Teacher attendance — specific paths before :id
router.get('/teacher-attendance/summary', getTeacherAttendanceSummary);
router.get('/teacher-attendance/photos', getTeacherAttendancePhotos);
router.get('/teacher-attendance', getTeacherAttendance);
router.post('/teacher-attendance', submitTeacherAttendance);
router.post('/teacher-attendance/check-in', checkInTeacher);
router.post('/teacher-attendance/check-out', checkOutTeacher);
router.post('/teacher-attendance/mark-status', markTeacherStatus);
router.post('/teacher-attendance/bulk-absent', bulkMarkAbsent);
router.put('/teacher-attendance/:id', updateTeacherAttendance);
router.post('/teacher-attendance/:id/verify', verifyTeacherAttendance);

module.exports = router;
