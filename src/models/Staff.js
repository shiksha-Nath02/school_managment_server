const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Non-teaching staff (no login). Salaried, paid via Expenditure (reason: salary).
const Staff = sequelize.define('Staff', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING(150), allowNull: false },
  designation: { type: DataTypes.STRING(100), allowNull: true },
  salary:      { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  phone:       { type: DataTypes.STRING(20), allowNull: true },
  is_active:   { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'staff',
  underscored: true,
  timestamps: true,
});

module.exports = Staff;
