// Adds students.pen_number (Permanent Education Number) and students.apaar_id
// (Automated Permanent Academic Account Registry ID). Both are optional free-text
// government identifiers entered by admins / class teachers. Idempotent.
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('students');
    if (!table.pen_number) {
      await queryInterface.addColumn('students', 'pen_number', {
        type: Sequelize.STRING(20),
        allowNull: true,
        after: 'admission_number',
      });
    }
    if (!table.apaar_id) {
      await queryInterface.addColumn('students', 'apaar_id', {
        type: Sequelize.STRING(20),
        allowNull: true,
        after: 'pen_number',
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('students');
    if (table.apaar_id) await queryInterface.removeColumn('students', 'apaar_id');
    if (table.pen_number) await queryInterface.removeColumn('students', 'pen_number');
  },
};
