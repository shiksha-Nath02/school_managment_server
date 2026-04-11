const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentLog = sequelize.define('PaymentLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  direction: {
    type: DataTypes.ENUM('income', 'expenditure'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reference_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reference_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  recorded_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'payment_log',
  timestamps: true,
  underscored: true
});

module.exports = PaymentLog;
