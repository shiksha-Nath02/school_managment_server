// Links uniform/book sales to a student via a real FK (students.id), so a sale
// can be shown on that student's portal and survives admission-number edits.
// Nullable: walk-in / unmatched sales are still allowed. Backfills from the
// existing admission_number text where it matches a student's admission_number.
module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of ['uniform_transactions', 'book_transactions']) {
      const cols = await queryInterface.describeTable(table);
      if (!cols.student_id) {
        await queryInterface.addColumn(table, 'student_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'students', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          after: 'admission_number',
        });
      }
      await queryInterface.sequelize.query(
        `UPDATE ${table} t
           JOIN students s ON s.admission_number = t.admission_number
            SET t.student_id = s.id
          WHERE t.student_id IS NULL AND t.admission_number IS NOT NULL`
      );
    }
  },

  async down(queryInterface) {
    for (const table of ['uniform_transactions', 'book_transactions']) {
      const cols = await queryInterface.describeTable(table);
      if (cols.student_id) await queryInterface.removeColumn(table, 'student_id');
    }
  },
};
