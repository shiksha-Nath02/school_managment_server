const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Generic key/value settings store (one row per setting), per-school DB.
const AppSetting = sequelize.define('AppSetting', {
  id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  setting_key:   { type: DataTypes.STRING(100), allowNull: false, unique: true },
  setting_value: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'app_settings',
  underscored: true,
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at',
});

module.exports = AppSetting;
