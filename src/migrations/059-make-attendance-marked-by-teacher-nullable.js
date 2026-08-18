'use strict';

// Student attendance can now be uploaded by an admin/superadmin, who has no
// `teachers` row. `attendance.marked_by_teacher` therefore becomes nullable
// (null = marked by an admin rather than a class teacher). The FK to `teachers`
// is unaffected — only the column's nullability changes.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('attendance', 'marked_by_teacher', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Note: reverting will fail if any admin-marked (NULL) rows exist.
    await queryInterface.changeColumn('attendance', 'marked_by_teacher', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
