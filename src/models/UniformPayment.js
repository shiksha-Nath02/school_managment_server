const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UniformPayment = sequelize.define('UniformPayment', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  transaction_id: { type: DataTypes.INTEGER, allowNull: false },
  amount_paid:    { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  payment_date:   { type: DataTypes.DATEONLY, allowNull: false },
  remarks:        { type: DataTypes.STRING(255), allowNull: true },
}, { tableName: 'uniform_payments', timestamps: true, underscored: true, paranoid: true });

module.exports = UniformPayment;
