// Audit trail for hard-deleted ledger transactions. A deleted payment is physically
// removed from its source table; this row preserves what it was, who deleted it, when
// and why. Surfaced read-only in the Transactions tab.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transaction_deletion_logs', {
      id:           { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      source:       { type: Sequelize.STRING(40), allowNull: false },
      ledger_ref:   { type: Sequelize.STRING(64), allowNull: true },
      amount:       { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      txn_date:     { type: Sequelize.DATEONLY, allowNull: true },
      description:  { type: Sequelize.TEXT, allowNull: true },
      student_id:   { type: Sequelize.INTEGER, allowNull: true },
      student_name: { type: Sequelize.STRING(150), allowNull: true },
      reason:       { type: Sequelize.TEXT, allowNull: true },
      deleted_by:   { type: Sequelize.INTEGER, allowNull: true },
      created_at:   { type: Sequelize.DATE, allowNull: false },
      updated_at:   { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('transaction_deletion_logs', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('transaction_deletion_logs');
  },
};
