const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UniformTransaction = sequelize.define('UniformTransaction', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_name:     { type: DataTypes.STRING(150), allowNull: false },
  father_phone:     { type: DataTypes.STRING(20),  allowNull: true },
  admission_number: { type: DataTypes.STRING(50),  allowNull: true },
  student_id:       { type: DataTypes.INTEGER, allowNull: true },
  item_id:          { type: DataTypes.INTEGER, allowNull: true }, // legacy single-item; NULL for multi-item sales (see uniform_transaction_items)
  quantity:         { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  to_be_paid:       { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discount:         { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  paid:             { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  // 'active' = live sale; 'returned' = item(s) handed back and money refunded.
  // Exchanges (size swaps) keep the sale 'active' and rewrite the line instead.
  status:           { type: DataTypes.ENUM('active', 'returned'), allowNull: false, defaultValue: 'active' },
}, { tableName: 'uniform_transactions', timestamps: true, underscored: true, paranoid: true });

module.exports = UniformTransaction;
