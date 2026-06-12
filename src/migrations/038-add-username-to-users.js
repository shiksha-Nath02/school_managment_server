'use strict';

// Adds users.username — the login identifier for the role-based auth system
// (admission number for students, teacher ID for teachers).
//
// Added nullable first so the migration also succeeds on a populated table,
// then any pre-existing rows are backfilled with a placeholder before the
// NOT NULL + UNIQUE constraint is enforced. On an empty prod DB the backfill
// is a no-op.
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('users');
    if (tableDesc.username) return;

    await queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'name',
    });

    // Backfill any existing rows with a unique placeholder.
    await queryInterface.sequelize.query(
      "UPDATE users SET username = CONCAT('legacy_', id) WHERE username IS NULL"
    );

    await queryInterface.changeColumn('users', 'username', {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'username');
  },
};
