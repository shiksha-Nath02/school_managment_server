const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// One admission-fee record per student per session.
// Due = annual_charge - discount - paid_amount. Soft-deletable (paranoid).
const AdmissionFee = sequelize.define('AdmissionFee', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id:    { type: DataTypes.INTEGER, allowNull: false },
  session_id:    { type: DataTypes.INTEGER, allowNull: false },
  annual_charge: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  discount:      { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  paid_amount:   { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  // true = assumed settled before tracking (pre-July); flips to false on a real payment.
  assumed_paid:  { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'admission_fees', timestamps: true, underscored: true, paranoid: true });

module.exports = AdmissionFee;
