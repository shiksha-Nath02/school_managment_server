const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookPayment = sequelize.define('BookPayment', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  transaction_id: { type: DataTypes.INTEGER, allowNull: false },
  amount_paid:    { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  payment_date:   { type: DataTypes.DATEONLY, allowNull: false },
  payment_method: { type: DataTypes.ENUM('cash', 'upi', 'cheque', 'bank_transfer', 'online'), allowNull: true },
  remarks:        { type: DataTypes.STRING(255), allowNull: true },
}, { tableName: 'book_payments', timestamps: true, underscored: true, paranoid: true });

module.exports = BookPayment;
