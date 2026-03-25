module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("fees", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      student_id: {
        type: Sequelize.INTEGER,
        references: { model: "students", key: "id" },
      },
      total_fee: Sequelize.DECIMAL,
      paid_amount: Sequelize.DECIMAL,
      due_amount: Sequelize.DECIMAL,
      last_payment_date: Sequelize.DATE,
      discount: Sequelize.DECIMAL,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("fees");
  },
};