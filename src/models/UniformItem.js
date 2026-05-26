const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UniformItem = sequelize.define('UniformItem', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  item_name:       { type: DataTypes.STRING(100), allowNull: false },
  size:            { type: DataTypes.STRING(20),  allowNull: false },
  price:           { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  units_available: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, { tableName: 'uniform_items', timestamps: true, underscored: true });

module.exports = UniformItem;
