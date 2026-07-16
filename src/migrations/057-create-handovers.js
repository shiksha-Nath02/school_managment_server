// Daily cash/online amount the accountant hands over to the head at end of day.
// Purely a reconciliation log — NEVER counted as an expense or in profit. The
// idea: (total income − total expenditure) for a day should equal the handover
// (cash + online). This table records the actual handover so the two can be
// compared on the Handover screen.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('handovers', {
      id:            { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      date:          { type: Sequelize.DATEONLY, allowNull: false },
      cash_amount:   { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      online_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      remarks:       { type: Sequelize.TEXT, allowNull: true },
      recorded_by:   { type: Sequelize.INTEGER, allowNull: true },
      created_at:    { type: Sequelize.DATE, allowNull: false },
      updated_at:    { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('handovers', ['date']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('handovers');
  },
};
