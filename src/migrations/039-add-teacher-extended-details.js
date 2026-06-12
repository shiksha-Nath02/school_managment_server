'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const t = await queryInterface.sequelize.transaction();
    try {
      // ① Personal
      await queryInterface.addColumn('teachers', 'date_of_birth',            { type: Sequelize.DATEONLY,    allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'gender',                   { type: Sequelize.ENUM('male', 'female', 'other'), allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'aadhaar_number',           { type: Sequelize.STRING(12),  allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'blood_group',              { type: Sequelize.STRING(5),   allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'marital_status',           { type: Sequelize.STRING(20),  allowNull: true }, { transaction: t });

      // ② Contact & address
      await queryInterface.addColumn('teachers', 'address',                  { type: Sequelize.TEXT,        allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'city',                     { type: Sequelize.STRING(100), allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'state',                    { type: Sequelize.STRING(100), allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'pincode',                  { type: Sequelize.STRING(10),  allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'alternate_phone',          { type: Sequelize.STRING(20),  allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'emergency_contact_name',   { type: Sequelize.STRING(150), allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'emergency_contact_phone',  { type: Sequelize.STRING(20),  allowNull: true }, { transaction: t });

      // ③ Professional / HR
      await queryInterface.addColumn('teachers', 'qualification',            { type: Sequelize.STRING(150), allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'designation',              { type: Sequelize.STRING(100), allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'department',               { type: Sequelize.STRING(100), allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'experience_years',         { type: Sequelize.INTEGER,     allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'employment_type',          { type: Sequelize.ENUM('full-time', 'part-time', 'contract'), allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'date_of_leaving',          { type: Sequelize.DATEONLY,    allowNull: true }, { transaction: t });

      // ④ Payroll / bank
      await queryInterface.addColumn('teachers', 'pan_number',               { type: Sequelize.STRING(10),  allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'bank_account_number',      { type: Sequelize.STRING(30),  allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'bank_ifsc',                { type: Sequelize.STRING(15),  allowNull: true }, { transaction: t });
      await queryInterface.addColumn('teachers', 'bank_name',                { type: Sequelize.STRING(150), allowNull: true }, { transaction: t });

      await t.commit();
    } catch (err) {
      await t.rollback();
      throw err;
    }
  },

  down: async (queryInterface) => {
    const cols = [
      'bank_name', 'bank_ifsc', 'bank_account_number', 'pan_number',
      'date_of_leaving', 'employment_type', 'experience_years', 'department', 'designation', 'qualification',
      'emergency_contact_phone', 'emergency_contact_name', 'alternate_phone', 'pincode', 'state', 'city', 'address',
      'marital_status', 'blood_group', 'aadhaar_number', 'gender', 'date_of_birth',
    ];
    for (const col of cols) {
      await queryInterface.removeColumn('teachers', col);
    }
  },
};
