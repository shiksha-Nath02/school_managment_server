// Adds students.admission_number — the school's admission number as an explicit,
// correctable column (separate from the auto-increment students.id, which is just
// an internal PK). Backfilled from users.username, where the admission number has
// been stored as the login id. Login is unchanged (still by username).
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('students');
    if (!table.admission_number) {
      await queryInterface.addColumn('students', 'admission_number', {
        type: Sequelize.STRING(50),
        allowNull: true,
        after: 'user_id',
      });
    }
    // Backfill: admission number = the student's login username.
    await queryInterface.sequelize.query(
      `UPDATE students s
         JOIN users u ON u.id = s.user_id
          SET s.admission_number = u.username
        WHERE s.admission_number IS NULL`
    );
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('students');
    if (table.admission_number) {
      await queryInterface.removeColumn('students', 'admission_number');
    }
  },
};
