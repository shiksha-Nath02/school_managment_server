const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// End-of-day cash/online handed over by the accountant to the head.
// Reconciliation log only — NOT an expense, NEVER counted in profit.
const Handover = sequelize.define('Handover', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date:          { type: DataTypes.DATEONLY, allowNull: false },
  cash_amount:   { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  online_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  remarks:       { type: DataTypes.TEXT, allowNull: true },
  recorded_by:   { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'handovers',
  timestamps: true,
  underscored: true,
});

module.exports = Handover;
