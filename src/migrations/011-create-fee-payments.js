module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("fee_payments", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      student_id: {
        type: Sequelize.INTEGER,
        references: { model: "students", key: "id" },
      },
      amount: Sequelize.DECIMAL,
      payment_date: Sequelize.DATE,
      payment_method: Sequelize.STRING,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("fee_payments");
  },
};