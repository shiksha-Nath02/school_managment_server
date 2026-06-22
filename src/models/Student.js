const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Student = sequelize.define(
  "Student",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "classes",
        key: "id",
      },
    },
    roll_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    admission_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'promoted'),
      allowNull: false,
      defaultValue: 'active',
    },
    aadhaar_number:           { type: DataTypes.STRING(12),  allowNull: true },
    father_name:              { type: DataTypes.STRING(150), allowNull: true },
    father_phone:             { type: DataTypes.STRING(20),  allowNull: true },
    father_aadhaar:           { type: DataTypes.STRING(12),  allowNull: true },
    mother_name:              { type: DataTypes.STRING(150), allowNull: true },
    mother_phone:             { type: DataTypes.STRING(20),  allowNull: true },
    mother_aadhaar:           { type: DataTypes.STRING(12),  allowNull: true },
    parents_pan:              { type: DataTypes.STRING(10),  allowNull: true },
    category:                 { type: DataTypes.ENUM('General', 'OBC', 'SC', 'ST', 'EWS'), allowNull: true },
    religion:                 { type: DataTypes.STRING(50),  allowNull: true },
    nationality:              { type: DataTypes.STRING(50),  allowNull: true, defaultValue: 'Indian' },
    blood_group:              { type: DataTypes.STRING(5),   allowNull: true },
    birth_certificate_number: { type: DataTypes.STRING(100), allowNull: true },
    ews_certificate_number:   { type: DataTypes.STRING(100), allowNull: true },
    pincode:                  { type: DataTypes.STRING(10),  allowNull: true },
    city:                     { type: DataTypes.STRING(100), allowNull: true },
    state:                    { type: DataTypes.STRING(100), allowNull: true },
  },
  {
    tableName: "students",
    underscored: true,
  }
);

module.exports = Student;
