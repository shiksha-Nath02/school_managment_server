const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'students', key: 'id' },
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'classes', key: 'id' },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('present', 'absent'),
    allowNull: false,
  },
  marked_by_teacher: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'teachers', key: 'id' },
  },
}, {
  tableName: 'attendance',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'date'],
      name: 'unique_student_date',
    },
  ],
});

module.exports = Attendance;