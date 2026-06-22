const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeePayment = sequelize.define('FeePayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  billing_month: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  billing_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount_paid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  fine_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  pending_after: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'upi', 'cheque', 'bank_transfer', 'online'),
    allowNull: true
  },
  receipt_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  is_system_generated: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  is_reversal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  reversal_for: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  received_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'fee_payments',
  timestamps: true,
  underscored: true
});

module.exports = FeePayment;
