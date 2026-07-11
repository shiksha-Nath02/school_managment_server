// Adds a payment method (cash/upi/cheque/bank_transfer/online) to uniform and
// book sale payments, mirroring the existing `fee_payments.payment_method` ENUM.
// Stored per payment row so the initial sale and each later installment can
// record how it was paid. Nullable so existing rows are unaffected.
const METHODS = ['cash', 'upi', 'cheque', 'bank_transfer', 'online'];

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of ['uniform_payments', 'book_payments']) {
      const cols = await queryInterface.describeTable(table);
      if (!cols.payment_method) {
        await queryInterface.addColumn(table, 'payment_method', {
          type: Sequelize.ENUM(...METHODS),
          allowNull: true,
          after: 'payment_date',
        });
      }
    }
  },

  async down(queryInterface) {
    for (const table of ['uniform_payments', 'book_payments']) {
      const cols = await queryInterface.describeTable(table);
      if (cols.payment_method) await queryInterface.removeColumn(table, 'payment_method');
    }
    // Clean up the ENUM types Postgres/MySQL leave behind (no-op on MySQL).
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_uniform_payments_payment_method";');
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_book_payments_payment_method";');
    }
  },
};
