const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Timetable = sequelize.define('Timetable', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  day: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isIn: [['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']]
    }
  },
  period: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 8
    }
  }
}, {
  tableName: 'timetable',
  timestamps: true,
  underscored: true
});

module.exports = Timetable;
