const sequelize = require("../config/database");
const User = require("./User");
const Student = require("./Student");
const Teacher = require("./Teacher");
const Class = require("./Class");

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

module.exports = {
  sequelize,
  User,
  Student,
  Teacher,
  Class,
};
