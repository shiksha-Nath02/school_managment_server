const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Circular = sequelize.define('Circular', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  category: { type: DataTypes.STRING(100), allowNull: true },
  file_key: { type: DataTypes.STRING(500), allowNull: false },
}, {
  tableName: 'circulars',
  underscored: true,
});

module.exports = Circular;
