// Adds an "adjustment" charge to a fee_payments row. This is an arbitrary
// amount ADDED to that row's running balance (alongside the monthly fee),
// used to carry forward "previous dues" — arrears from before the ledger
// started tracking (e.g. pre-July months). recalculateChain accounts for it,
// so the carried balance survives reversals / backdated payments / fee edits.
// Defaults to 0 so existing rows are unaffected.
module.exports = {
  async up(queryInterface, Sequelize) {
    const cols = await queryInterface.describeTable('fee_payments');
    if (!cols.adjustment) {
      await queryInterface.addColumn('fee_payments', 'adjustment', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        after: 'fine_amount',
      });
    }
  },

  async down(queryInterface) {
    const cols = await queryInterface.describeTable('fee_payments');
    if (cols.adjustment) await queryInterface.removeColumn('fee_payments', 'adjustment');
  },
};
