const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClassTask = sequelize.define('ClassTask', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  tasks_data: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Array of {period, subject, classwork, homework}'
  }
}, {
  tableName: 'class_tasks',
  timestamps: true,
  underscored: true
});

module.exports = ClassTask;
