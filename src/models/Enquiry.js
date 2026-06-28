const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enquiry = sequelize.define('Enquiry', {
  id:      { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  type:    { type: DataTypes.ENUM('student', 'teacher'), allowNull: false },
  name:    { type: DataTypes.STRING(150), allowNull: false },
  email:   { type: DataTypes.STRING(150), allowNull: true },
  phone:   { type: DataTypes.STRING(20), allowNull: true },
  detail:  { type: DataTypes.STRING(150), allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: true },
  status:  { type: DataTypes.ENUM('new', 'contacted', 'closed'), allowNull: false, defaultValue: 'new' },
}, {
  tableName: 'enquiries',
  underscored: true,
  timestamps: true,
});

module.exports = Enquiry;
