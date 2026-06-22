const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  start_month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 12 }
  },
  start_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  end_month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 12 }
  },
  end_year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  excluded_months: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  fine_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  fine_per_day: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0
  },
  grace_period_days: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 10
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'sessions',
  timestamps: true,
  underscored: true
});

module.exports = Session;
