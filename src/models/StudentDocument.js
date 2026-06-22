const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentDocument = sequelize.define('StudentDocument', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  document_type: {
    type: DataTypes.ENUM(
      'student_aadhaar', 'father_aadhaar', 'mother_aadhaar',
      'father_pan', 'mother_pan', 'birth_certificate', 'category_certificate'
    ),
    allowNull: false,
  },
  file_path: { type: DataTypes.STRING(500), allowNull: false },
  file_name: { type: DataTypes.STRING(255), allowNull: false },
  file_size: { type: DataTypes.INTEGER, allowNull: true },
  mime_type: { type: DataTypes.STRING(100), allowNull: true },
  uploaded_by: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'student_documents',
  underscored: true,
});

module.exports = StudentDocument;
