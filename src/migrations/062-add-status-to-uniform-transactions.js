// Adds a "status" to uniform_transactions so a sale can be marked as fully
// RETURNED (item(s) handed back, money refunded) without deleting the record.
// 'active' is the normal state; exchanges (size swaps) stay 'active' and just
// rewrite their line(s). Defaults to 'active' so existing rows are unaffected.
module.exports = {
  async up(queryInterface, Sequelize) {
    const cols = await queryInterface.describeTable('uniform_transactions');
    if (!cols.status) {
      await queryInterface.addColumn('uniform_transactions', 'status', {
        type: Sequelize.ENUM('active', 'returned'),
        allowNull: false,
        defaultValue: 'active',
        after: 'paid',
      });
    }
  },

  async down(queryInterface) {
    const cols = await queryInterface.describeTable('uniform_transactions');
    if (cols.status) await queryInterface.removeColumn('uniform_transactions', 'status');
    // Drop the ENUM type on Postgres; a no-op on MySQL.
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_uniform_transactions_status";');
    }
  },
};
