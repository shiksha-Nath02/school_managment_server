const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// School-wide holiday. A declared non-working day (with a reason). Sundays are
// off by default in code and are NOT stored here — only explicit holidays are.
const Holiday = sequelize.define('Holiday', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'holidays',
  timestamps: true,
  underscored: true,
});

module.exports = Holiday;
