'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('students', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'promoted'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'inactive = left school, promoted = moved to next class in new session'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('students', 'status');
  }
};
