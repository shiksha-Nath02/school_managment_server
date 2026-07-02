// Adds a flat-rupee discount to uniform/book sales. The stored `to_be_paid`
// is already the NET amount (price*qty - discount); `discount` is kept
// alongside it so the original gross can be shown/audited. Defaults to 0 so
// existing rows are unaffected.
module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of ['uniform_transactions', 'book_transactions']) {
      const cols = await queryInterface.describeTable(table);
      if (!cols.discount) {
        await queryInterface.addColumn(table, 'discount', {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
          after: 'to_be_paid',
        });
      }
    }
  },

  async down(queryInterface) {
    for (const table of ['uniform_transactions', 'book_transactions']) {
      const cols = await queryInterface.describeTable(table);
      if (cols.discount) await queryInterface.removeColumn(table, 'discount');
    }
  },
};
