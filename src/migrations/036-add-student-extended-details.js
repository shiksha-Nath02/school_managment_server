'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('students', 'aadhaar_number',           { type: Sequelize.STRING(12),  allowNull: true }, { transaction: t });
      await queryInterface.addColumn('students', 'father_name',              { type: Sequelize.STRING(150), allowNull: true }, { transaction: t });
      await queryInterface.addColumn('students', 'father_phone',             { type: Sequelize.STRING(20),  allowNull: true }, { transaction: t });
      await queryInterface.addColumn('students', 'father_aadhaar',           { type: Sequelize.STRING(12),  allowNull: true }, { transaction: t });
      await queryInterface.addColumn('students', 'mother_name',              { type: Sequelize.STRING(150), allowNull: true }, { transaction: t });
      await queryInterface.addColumn('students', 'mother_phone',             { type: Sequelize.STRING(20),  allowNull: true }, { transaction: t });
      await queryInterface.addColumn('students', 'mother_aadhaar',           { type: Sequelize.STRING(12),  allowNull: true }, { transaction: t });
      await queryInterface.addColumn('students', 'parents_pan',              { type: Sequelize.STRING(10),  allowNull: true }, { transaction: t });
      await queryInterface.addColumn('students', 'category',                 { type: Sequelize.ENUM('General', 'OBC', 'SC', 'ST', 'EWS'), allowNull: true }, { transaction: t });
      await queryInterface.addColumn('students', 'religion',                 { type: Sequelize.STRING(50),  allowNull: true }, { transaction: t });
      await queryInterface.addColumn('students', 'nationality',              { type: Sequelize.STRING(50),  allowNull: true, defaultValue: 'Indian' }, { transaction: t });
      await queryInterface.addColumn('students', 'blood_group',              { type: Sequelize.STRING(5),   allowNull: true }, { transaction: t });
      await queryInterface.addColumn('students', 'birth_certificate_number', { type: Sequelize.STRING(100), allowNull: true }, { transaction: t });
      await queryInterface.addColumn('students', 'ews_certificate_number',   { type: Sequelize.STRING(100), allowNull: true }, { transaction: t });
      await queryInterface.addColumn('students', 'pincode',                  { type: Sequelize.STRING(10),  allowNull: true }, { transaction: t });
      await queryInterface.addColumn('students', 'city',                     { type: Sequelize.STRING(100), allowNull: true }, { transaction: t });
      await queryInterface.addColumn('students', 'state',                    { type: Sequelize.STRING(100), allowNull: true }, { transaction: t });
      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  down: async (queryInterface) => {
    const cols = [
      'state', 'city', 'pincode', 'ews_certificate_number', 'birth_certificate_number',
      'blood_group', 'nationality', 'religion', 'category', 'parents_pan',
      'mother_aadhaar', 'mother_phone', 'mother_name',
      'father_aadhaar', 'father_phone', 'father_name', 'aadhaar_number',
    ];
    for (const col of cols) {
      await queryInterface.removeColumn('students', col);
    }
  },
};
