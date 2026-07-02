const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookTransaction = sequelize.define('BookTransaction', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_name:     { type: DataTypes.STRING(150), allowNull: false },
  father_phone:     { type: DataTypes.STRING(20),  allowNull: true },
  admission_number: { type: DataTypes.STRING(50),  allowNull: true },
  student_id:       { type: DataTypes.INTEGER, allowNull: true },
  item_id:          { type: DataTypes.INTEGER, allowNull: false },
  quantity:         { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  to_be_paid:       { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discount:         { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  paid:             { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
}, { tableName: 'book_transactions', timestamps: true, underscored: true });

module.exports = BookTransaction;
