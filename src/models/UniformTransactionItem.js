const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// A line item within a uniform sale (uniform_transactions is the sale/parent).
// unit_price is snapshotted at sale time so later price edits don't rewrite history.
const UniformTransactionItem = sequelize.define('UniformTransactionItem', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  transaction_id: { type: DataTypes.INTEGER, allowNull: false },
  item_id:        { type: DataTypes.INTEGER, allowNull: false },
  quantity:       { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  unit_price:     { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  line_total:     { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: 'uniform_transaction_items', timestamps: true, underscored: true });

module.exports = UniformTransactionItem;
