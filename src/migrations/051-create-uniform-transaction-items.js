// Multi-item uniform sales. A uniform_transaction is the "sale" (student +
// totals + discount + paid + payments). Historically it held exactly one item
// inline (item_id/quantity). This adds a child table so one sale can carry many
// items, and relaxes uniform_transactions.item_id to nullable — new multi-item
// sales leave it NULL and store their lines in uniform_transaction_items, while
// existing single-item rows keep their item_id untouched.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('uniform_transaction_items', {
      id:             { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      transaction_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'uniform_transactions', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'uniform_items', key: 'id' },
        onUpdate: 'CASCADE',
      },
      quantity:   { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      unit_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      line_total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('uniform_transaction_items', ['transaction_id'], {
      name: 'idx_uti_transaction',
    });

    // Relax the legacy inline item_id so multi-item sales can leave it NULL.
    await queryInterface.changeColumn('uniform_transactions', 'item_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('uniform_transaction_items');
    // Note: not forcing item_id back to NOT NULL, since multi-item rows may
    // legitimately have left it NULL. Widening is safe to leave in place.
    await queryInterface.changeColumn('uniform_transactions', 'item_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
