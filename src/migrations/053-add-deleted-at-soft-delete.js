// Soft delete for financial records. Adds a nullable deleted_at to the expense
// and sale/payment tables so their models can run in Sequelize "paranoid" mode:
// .destroy() sets deleted_at instead of removing the row, and all queries hide
// soft-deleted rows automatically (including reports/profit). Recoverable via DB.
const TABLES = [
  'expenses',
  'uniform_transactions',
  'uniform_payments',
  'uniform_transaction_items',
  'book_transactions',
  'book_payments',
];

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of TABLES) {
      const cols = await queryInterface.describeTable(table);
      if (!cols.deleted_at) {
        await queryInterface.addColumn(table, 'deleted_at', {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        });
      }
    }
  },

  async down(queryInterface) {
    for (const table of TABLES) {
      const cols = await queryInterface.describeTable(table);
      if (cols.deleted_at) await queryInterface.removeColumn(table, 'deleted_at');
    }
  },
};
