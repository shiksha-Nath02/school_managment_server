'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('users');

    if (!tableDesc.phone) {
      await queryInterface.addColumn('users', 'phone', {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!tableDesc.updated_at) {
      await queryInterface.addColumn('users', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'phone');
    await queryInterface.removeColumn('users', 'updated_at');
  },
};