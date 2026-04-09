const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TeacherAttendance = sequelize.define('TeacherAttendance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  teacher_id: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'present' },
  check_in_time: { type: DataTypes.TIME, allowNull: true },
  check_out_time: { type: DataTypes.TIME, allowNull: true },
  leave_type: { type: DataTypes.STRING(50), allowNull: true },
  remarks: { type: DataTypes.TEXT, allowNull: true },
  marked_by: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'teacher_attendance',
  timestamps: true,
  underscored: true,
});

module.exports = TeacherAttendance;
