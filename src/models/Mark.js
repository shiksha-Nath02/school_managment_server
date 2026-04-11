const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mark = sequelize.define('Mark', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  exam_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  max_marks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  marks_obtained: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  is_absent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'marks',
  timestamps: true,
  underscored: true
});

module.exports = Mark;
