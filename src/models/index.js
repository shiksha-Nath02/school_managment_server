const sequelize = require("../config/database");
const User = require("./User");
const Student = require("./Student");
const Teacher = require("./Teacher");
const Class = require("./Class");
const Attendance = require('./Attendance');
const TeacherAttendance = require('./TeacherAttendance');
const Timetable = require('./Timetable');
const ClassTask = require('./ClassTask');
const Session = require('./Session');
const StudentFee = require('./StudentFee');
const FeePayment = require('./FeePayment');
const PaymentLog = require('./PaymentLog');

// ===== ASSOCIATIONS =====

// User <-> Student (one-to-one)
User.hasOne(Student, { foreignKey: "user_id", as: "student" });
Student.belongsTo(User, { foreignKey: "user_id", as: "user" });

// User <-> Teacher (one-to-one)
User.hasOne(Teacher, { foreignKey: "user_id", as: "teacher" });
Teacher.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Class <-> Student (one-to-many)
Class.hasMany(Student, { foreignKey: "class_id", as: "students" });
Student.belongsTo(Class, { foreignKey: "class_id", as: "class" });

// Class <-> Teacher (class teacher)
Teacher.hasMany(Class, { foreignKey: "class_teacher_id", as: "classes" });
Class.belongsTo(Teacher, { foreignKey: "class_teacher_id", as: "classTeacher" });

Student.hasMany(Attendance, { foreignKey: 'student_id', as: 'attendanceRecords' });
Attendance.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

Class.hasMany(Attendance, { foreignKey: 'class_id', as: 'attendanceRecords' });
Attendance.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

Teacher.hasMany(Attendance, { foreignKey: 'marked_by_teacher', as: 'markedAttendance' });
Attendance.belongsTo(Teacher, { foreignKey: 'marked_by_teacher', as: 'markedByTeacher' });

// TeacherAttendance associations
Teacher.hasMany(TeacherAttendance, { foreignKey: 'teacher_id', as: 'teacherAttendanceRecords' });
TeacherAttendance.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });

// Timetable associations
Class.hasMany(Timetable, { foreignKey: 'class_id', as: 'timetableEntries' });
Timetable.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Teacher.hasMany(Timetable, { foreignKey: 'teacher_id', as: 'timetableEntries' });
Timetable.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });

// ClassTask associations
Class.hasMany(ClassTask, { foreignKey: 'class_id', as: 'classTasks' });
ClassTask.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Teacher.hasMany(ClassTask, { foreignKey: 'teacher_id', as: 'classTasks' });
ClassTask.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });

// Session associations
Session.hasMany(StudentFee, { foreignKey: 'session_id', as: 'studentFees' });
StudentFee.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });

// StudentFee associations
Student.hasMany(StudentFee, { foreignKey: 'student_id', as: 'feeConfigs' });
StudentFee.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// FeePayment associations
Student.hasMany(FeePayment, { foreignKey: 'student_id', as: 'feePayments' });
FeePayment.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
FeePayment.belongsTo(FeePayment, { foreignKey: 'reversal_for', as: 'originalPayment' });

module.exports = {
  sequelize,
  User,
  Student,
  Teacher,
  Class,
  Attendance,
  TeacherAttendance,
  Timetable,
  ClassTask,
  Session,
  StudentFee,
  FeePayment,
  PaymentLog,
};