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
const AdmissionFee = require('./AdmissionFee');
const FeePayment = require('./FeePayment');
const PaymentLog = require('./PaymentLog');
const Mark = require('./Mark');
const Inventory = require('./Inventory');
const InventoryTransaction = require('./InventoryTransaction');
const UniformItem = require('./UniformItem');
const UniformTransaction = require('./UniformTransaction');
const UniformTransactionItem = require('./UniformTransactionItem');
const UniformPayment = require('./UniformPayment');
const BookItem = require('./BookItem');
const BookTransaction = require('./BookTransaction');
const BookPayment = require('./BookPayment');
const Expense = require('./Expense');
const Handover = require('./Handover');
const StudentDocument = require('./StudentDocument');
const GalleryImage = require('./GalleryImage');
const Circular = require('./Circular');
const AppSetting = require('./AppSetting');
const Staff = require('./Staff');
const Enquiry = require('./Enquiry');
const Holiday = require('./Holiday');

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

// AdmissionFee associations
Session.hasMany(AdmissionFee, { foreignKey: 'session_id', as: 'admissionFees' });
AdmissionFee.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });
Student.hasMany(AdmissionFee, { foreignKey: 'student_id', as: 'admissionFees' });
AdmissionFee.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// FeePayment associations
Student.hasMany(FeePayment, { foreignKey: 'student_id', as: 'feePayments' });
FeePayment.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
FeePayment.belongsTo(FeePayment, { foreignKey: 'reversal_for', as: 'originalPayment' });

// Mark associations
Student.hasMany(Mark, { foreignKey: 'student_id', as: 'marks' });
Mark.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
Class.hasMany(Mark, { foreignKey: 'class_id', as: 'marks' });
Mark.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });

// Inventory associations
Inventory.hasMany(InventoryTransaction, { foreignKey: 'item_id', as: 'transactions' });
InventoryTransaction.belongsTo(Inventory, { foreignKey: 'item_id', as: 'item' });

Student.hasMany(InventoryTransaction, { foreignKey: 'student_id', as: 'inventoryPurchases' });
InventoryTransaction.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// Uniform associations
UniformItem.hasMany(UniformTransaction, { foreignKey: 'item_id', as: 'transactions' });
UniformTransaction.belongsTo(UniformItem, { foreignKey: 'item_id', as: 'item' });
UniformTransaction.hasMany(UniformPayment, { foreignKey: 'transaction_id', as: 'payments' });
UniformPayment.belongsTo(UniformTransaction, { foreignKey: 'transaction_id', as: 'transaction' });
// Multi-item sales: a transaction (sale) can carry many line items
UniformTransaction.hasMany(UniformTransactionItem, { foreignKey: 'transaction_id', as: 'items' });
UniformTransactionItem.belongsTo(UniformTransaction, { foreignKey: 'transaction_id', as: 'transaction' });
UniformTransactionItem.belongsTo(UniformItem, { foreignKey: 'item_id', as: 'item' });
UniformItem.hasMany(UniformTransactionItem, { foreignKey: 'item_id', as: 'saleLines' });

// StudentDocument associations
Student.hasMany(StudentDocument, { foreignKey: 'student_id', as: 'documents' });
StudentDocument.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// Book associations
BookItem.hasMany(BookTransaction, { foreignKey: 'item_id', as: 'transactions' });
BookTransaction.belongsTo(BookItem, { foreignKey: 'item_id', as: 'item' });
BookTransaction.hasMany(BookPayment, { foreignKey: 'transaction_id', as: 'payments' });
BookPayment.belongsTo(BookTransaction, { foreignKey: 'transaction_id', as: 'transaction' });

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
  AdmissionFee,
  FeePayment,
  PaymentLog,
  Mark,
  Inventory,
  InventoryTransaction,
  UniformItem,
  UniformTransaction,
  UniformTransactionItem,
  UniformPayment,
  BookItem,
  BookTransaction,
  BookPayment,
  Expense,
  Handover,
  StudentDocument,
  GalleryImage,
  Circular,
  AppSetting,
  Staff,
  Enquiry,
  Holiday,
};