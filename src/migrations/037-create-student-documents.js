'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('student_documents', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      student_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'students', key: 'id' }, onDelete: 'CASCADE',
      },
      document_type: {
        type: Sequelize.ENUM(
          'student_aadhaar', 'father_aadhaar', 'mother_aadhaar',
          'father_pan', 'mother_pan', 'birth_certificate', 'category_certificate'
        ),
        allowNull: false,
      },
      file_path: { type: Sequelize.STRING(500), allowNull: false },
      file_name: { type: Sequelize.STRING(255), allowNull: false },
      file_size: { type: Sequelize.INTEGER, allowNull: true },
      mime_type: { type: Sequelize.STRING(100), allowNull: true },
      uploaded_by: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'users', key: 'id' }, onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('student_documents', ['student_id', 'document_type'], {
      unique: true, name: 'unique_student_doc_type',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('student_documents');
  },
};
