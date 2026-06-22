const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Teacher = sequelize.define(
  "Teacher",
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
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    joining_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // ① Personal
    date_of_birth:           { type: DataTypes.DATEONLY,                              allowNull: true },
    gender:                  { type: DataTypes.ENUM('male', 'female', 'other'),      allowNull: true },
    aadhaar_number:          { type: DataTypes.STRING(12),                           allowNull: true },
    blood_group:             { type: DataTypes.STRING(5),                            allowNull: true },
    marital_status:          { type: DataTypes.STRING(20),                           allowNull: true },

    // ② Contact & address
    address:                 { type: DataTypes.TEXT,                                 allowNull: true },
    city:                    { type: DataTypes.STRING(100),                          allowNull: true },
    state:                   { type: DataTypes.STRING(100),                          allowNull: true },
    pincode:                 { type: DataTypes.STRING(10),                           allowNull: true },
    alternate_phone:         { type: DataTypes.STRING(20),                           allowNull: true },
    emergency_contact_name:  { type: DataTypes.STRING(150),                          allowNull: true },
    emergency_contact_phone: { type: DataTypes.STRING(20),                           allowNull: true },

    // ③ Professional / HR
    qualification:           { type: DataTypes.STRING(150),                          allowNull: true },
    designation:             { type: DataTypes.STRING(100),                          allowNull: true },
    department:              { type: DataTypes.STRING(100),                          allowNull: true },
    experience_years:        { type: DataTypes.INTEGER,                              allowNull: true },
    employment_type:         { type: DataTypes.ENUM('full-time', 'part-time', 'contract'), allowNull: true },
    date_of_leaving:         { type: DataTypes.DATEONLY,                             allowNull: true },

    // ④ Payroll / bank
    pan_number:              { type: DataTypes.STRING(10),                           allowNull: true },
    bank_account_number:     { type: DataTypes.STRING(30),                           allowNull: true },
    bank_ifsc:               { type: DataTypes.STRING(15),                           allowNull: true },
    bank_name:               { type: DataTypes.STRING(150),                          allowNull: true },
  },
  {
    tableName: "teachers",
    underscored: true,
  }
);

module.exports = Teacher;
