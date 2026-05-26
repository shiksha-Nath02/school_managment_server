module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('uniform_payments', {
      id:             { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      transaction_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'uniform_transactions', key: 'id' } },
      amount_paid:    { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      payment_date:   { type: Sequelize.DATEONLY, allowNull: false },
      remarks:        { type: Sequelize.STRING(255), allowNull: true },
      created_at:     { type: Sequelize.DATE, allowNull: false },
      updated_at:     { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => queryInterface.dropTable('uniform_payments'),
};
