const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryTransaction = sequelize.define(
  'InventoryTransaction',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'inventory', key: 'id' },
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'students', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM('purchase', 'sale', 'distribute'),
      allowNull: false,
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    reference_note: { type: DataTypes.TEXT, allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
  },
  {
    tableName: 'inventory_transactions',
    underscored: true,
  }
);

module.exports = InventoryTransaction;
