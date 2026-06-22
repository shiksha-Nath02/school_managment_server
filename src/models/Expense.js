const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  category:    { type: DataTypes.STRING,          allowNull: false },
  amount:      { type: DataTypes.DECIMAL(10, 2),  allowNull: false },
  date:        { type: DataTypes.DATEONLY,         allowNull: false },
  description: { type: DataTypes.TEXT,             allowNull: true },
}, {
  tableName:  'expenses',
  timestamps: false,
});

module.exports = Expense;
