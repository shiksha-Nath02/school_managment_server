'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('teacher_attendance');

    if (!table.check_in_time)
      await queryInterface.addColumn('teacher_attendance', 'check_in_time', { type: Sequelize.TIME, allowNull: true, defaultValue: null });
    if (!table.check_out_time)
      await queryInterface.addColumn('teacher_attendance', 'check_out_time', { type: Sequelize.TIME, allowNull: true, defaultValue: null });
    if (!table.leave_type)
      await queryInterface.addColumn('teacher_attendance', 'leave_type', { type: Sequelize.STRING(50), allowNull: true, defaultValue: null });
    if (!table.remarks)
      await queryInterface.addColumn('teacher_attendance', 'remarks', { type: Sequelize.TEXT, allowNull: true, defaultValue: null });
    if (!table.marked_by)
      await queryInterface.addColumn('teacher_attendance', 'marked_by', { type: Sequelize.INTEGER, allowNull: true, defaultValue: null });
    if (!table.created_at)
      await queryInterface.addColumn('teacher_attendance', 'created_at', { type: Sequelize.DATE, allowNull: true, defaultValue: null });
    if (!table.updated_at)
      await queryInterface.addColumn('teacher_attendance', 'updated_at', { type: Sequelize.DATE, allowNull: true, defaultValue: null });

    // Change status from ENUM to VARCHAR to support more values
    await queryInterface.changeColumn('teacher_attendance', 'status', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'present',
    });
  },

  async down(queryInterface, Sequelize) {
    for (const col of ['check_in_time', 'check_out_time', 'leave_type', 'remarks', 'marked_by', 'created_at', 'updated_at']) {
      await queryInterface.removeColumn('teacher_attendance', col);
    }
    await queryInterface.changeColumn('teacher_attendance', 'status', {
      type: Sequelize.ENUM('present', 'absent'),
      allowNull: false,
    });
  },
};
