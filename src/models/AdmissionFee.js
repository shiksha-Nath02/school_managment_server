const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// One annual-fee record per student per session (table: annual_fees).
// Due = annual_charge - discount - paid_amount. Soft-deletable (paranoid).
// NOTE: the JS model/class name is kept as AdmissionFee for now; only the
// underlying table was renamed admission_fees -> annual_fees.
const AdmissionFee = sequelize.define('AdmissionFee', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id:    { type: DataTypes.INTEGER, allowNull: false },
  session_id:    { type: DataTypes.INTEGER, allowNull: false },
  annual_charge: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  discount:      { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  paid_amount:   { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  // true = assumed settled before tracking (pre-July); flips to false on a real payment.
  assumed_paid:  { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'annual_fees', timestamps: true, underscored: true, paranoid: true });

module.exports = AdmissionFee;
