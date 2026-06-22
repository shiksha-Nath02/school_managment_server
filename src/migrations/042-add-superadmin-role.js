module.exports = {
  async up(queryInterface, Sequelize) {
    // Extend the users.role ENUM to include 'superadmin'
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'teacher', 'student', 'superadmin'),
      allowNull: false,
    });

    // Promote the existing default admin account to superadmin.
    await queryInterface.sequelize.query(
      "UPDATE users SET role = 'superadmin' WHERE username = 'admin'"
    );
  },

  async down(queryInterface, Sequelize) {
    // Revert any superadmin accounts back to admin before shrinking the ENUM.
    await queryInterface.sequelize.query(
      "UPDATE users SET role = 'admin' WHERE role = 'superadmin'"
    );

    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'teacher', 'student'),
      allowNull: false,
    });
  },
};
