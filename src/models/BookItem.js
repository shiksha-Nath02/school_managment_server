const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookItem = sequelize.define('BookItem', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  book_name:       { type: DataTypes.STRING(200), allowNull: false },
  class_name:      { type: DataTypes.STRING(50),  allowNull: true },
  subject:         { type: DataTypes.STRING(100), allowNull: true },
  price:           { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  units_available: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, { tableName: 'book_items', timestamps: true, underscored: true });

module.exports = BookItem;
