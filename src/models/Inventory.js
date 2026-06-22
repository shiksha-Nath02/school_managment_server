const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define(
  'Inventory',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    item_name: { type: DataTypes.STRING, allowNull: false },
    category: {
      type: DataTypes.ENUM('pantry', 'stationary', 'books', 'uniform'),
      allowNull: false,
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: 'inventory',
    underscored: true,
  }
);

module.exports = Inventory;
