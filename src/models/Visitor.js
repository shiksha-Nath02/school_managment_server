const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Visitor = sequelize.define('Visitor', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING(150), allowNull: false },
  phone:       { type: DataTypes.STRING(20), allowNull: true },
  purpose:     { type: DataTypes.STRING(255), allowNull: true },
  whomToMeet:  { type: DataTypes.STRING(150), allowNull: true, field: 'whom_to_meet' },
  numPersons:  { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'num_persons' },
  visitDate:   { type: DataTypes.DATEONLY, allowNull: false, field: 'visit_date' },
  timeIn:      { type: DataTypes.DATE, allowNull: false, field: 'time_in' },
  timeOut:     { type: DataTypes.DATE, allowNull: true, field: 'time_out' },
  remarks:     { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'visitors',
  underscored: true,
  timestamps: true,
});

module.exports = Visitor;
