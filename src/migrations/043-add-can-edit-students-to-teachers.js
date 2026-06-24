// Per-teacher permission: when true (toggled by a superadmin), the teacher may
// edit the profile of students in her OWN class. Default false — no teacher can
// edit students until a superadmin enables it for her.
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('teachers');
    if (!columns.can_edit_students) {
      await queryInterface.addColumn('teachers', 'can_edit_students', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable('teachers');
    if (columns.can_edit_students) {
      await queryInterface.removeColumn('teachers', 'can_edit_students');
    }
  },
};
