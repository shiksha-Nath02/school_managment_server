// Adds an "advance" (opening credit) to a fee_payments row. This is the mirror
// of `adjustment` (previous dues): instead of ADDING to the running balance, it
// is SUBTRACTED — used to carry forward a credit a student paid ahead BEFORE the
// ledger started tracking. Like previous dues, it moves the ledger balance only
// and is NEVER written to payment_log, so it is not counted as income/profit.
// recalculateChain subtracts it, so the credit survives reversals / backdated
// payments / fee edits. Defaults to 0 so existing rows are unaffected.
module.exports = {
  async up(queryInterface, Sequelize) {
    const cols = await queryInterface.describeTable('fee_payments');
    if (!cols.advance) {
      await queryInterface.addColumn('fee_payments', 'advance', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        after: 'adjustment',
      });
    }
  },

  async down(queryInterface) {
    const cols = await queryInterface.describeTable('fee_payments');
    if (cols.advance) await queryInterface.removeColumn('fee_payments', 'advance');
  },
};
