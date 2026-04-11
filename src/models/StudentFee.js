const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentFee = sequelize.define('StudentFee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  monthly_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  discount_reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'student_fees',
  timestamps: true,
  underscored: true
});

module.exports = StudentFee;
