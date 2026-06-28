const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  category:    { type: DataTypes.STRING,          allowNull: false },
  amount:      { type: DataTypes.DECIMAL(10, 2),  allowNull: false }, // final/net amount paid
  date:        { type: DataTypes.DATEONLY,         allowNull: false },
  description: { type: DataTypes.TEXT,             allowNull: true },
  // Salary-only fields (null for other reasons):
  teacher_id:   { type: DataTypes.INTEGER,         allowNull: true }, // payee if a teacher
  staff_id:     { type: DataTypes.INTEGER,         allowNull: true }, // payee if non-teaching staff
  gross_amount: { type: DataTypes.DECIMAL(10, 2),  allowNull: true }, // configured salary
  deduction:    { type: DataTypes.DECIMAL(10, 2),  allowNull: true }, // penalty/deduction
}, {
  tableName:  'expenses',
  timestamps: false,
  underscored: true,
});

module.exports = Expense;
