const sequelize = require("../config/database");
const User = require("./User");
const Student = require("./Student");
const Teacher = require("./Teacher");
const Class = require("./Class");
const Attendance = require('./Attendance');
const TeacherAttendance = require('./TeacherAttendance');

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

module.exports = {
  sequelize,
  User,
  Student,
  Teacher,
  Class,
  Attendance,
  TeacherAttendance,
};