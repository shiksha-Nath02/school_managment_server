'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('teacher_attendance', 'check_in_image', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'check_in_time',
    });
    await queryInterface.addColumn('teacher_attendance', 'check_out_image', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'check_out_time',
    });
    await queryInterface.addColumn('teacher_attendance', 'is_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: 'remarks',
    });
    await queryInterface.addColumn('teacher_attendance', 'verified_at', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'is_verified',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('teacher_attendance', 'check_in_image');
    await queryInterface.removeColumn('teacher_attendance', 'check_out_image');
    await queryInterface.removeColumn('teacher_attendance', 'is_verified');
    await queryInterface.removeColumn('teacher_attendance', 'verified_at');
  },
};
