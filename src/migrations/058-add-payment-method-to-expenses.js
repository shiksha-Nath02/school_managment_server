// Adds cash/online payment method to expenses so the Handover reconciliation can
// split expenditure by method. Existing rows default to 'cash' (the common case),
// so historical expenditure is treated as cash unless corrected.
module.exports = {
  async up(queryInterface, Sequelize) {
    const cols = await queryInterface.describeTable('expenses');
    if (!cols.payment_method) {
      await queryInterface.addColumn('expenses', 'payment_method', {
        type: Sequelize.ENUM('cash', 'online'),
        allowNull: false,
        defaultValue: 'cash',
        after: 'amount',
      });
    }
  },

  async down(queryInterface) {
    const cols = await queryInterface.describeTable('expenses');
    if (cols.payment_method) await queryInterface.removeColumn('expenses', 'payment_method');
  },
};
