'use strict';

// Renames the "admission fee" concept to "annual fee" at the schema level:
//   - table  admission_fees      -> annual_fees
//   - column sessions.admission_fee -> sessions.annual_fee
// Both are metadata-only renames (no data transformation), so all existing
// rows / ids / indexes are preserved. Reversible via down().
//
// NOTE: payment_log.reference_type values ('admission_fees') are intentionally
// left as-is — they are historical audit labels, not a DB-enforced FK.

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const norm = tables.map((t) => (typeof t === 'string' ? t : t.tableName));

    if (norm.includes('admission_fees') && !norm.includes('annual_fees')) {
      await queryInterface.renameTable('admission_fees', 'annual_fees');
    }

    const sessionCols = await queryInterface.describeTable('sessions');
    if (sessionCols.admission_fee && !sessionCols.annual_fee) {
      await queryInterface.renameColumn('sessions', 'admission_fee', 'annual_fee');
    }
  },

  async down(queryInterface, Sequelize) {
    const sessionCols = await queryInterface.describeTable('sessions');
    if (sessionCols.annual_fee && !sessionCols.admission_fee) {
      await queryInterface.renameColumn('sessions', 'annual_fee', 'admission_fee');
    }

    const tables = await queryInterface.showAllTables();
    const norm = tables.map((t) => (typeof t === 'string' ? t : t.tableName));
    if (norm.includes('annual_fees') && !norm.includes('admission_fees')) {
      await queryInterface.renameTable('annual_fees', 'admission_fees');
    }
  },
};
