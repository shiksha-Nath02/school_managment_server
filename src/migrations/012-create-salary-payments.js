module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("salary_payments", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      teacher_id: {
        type: Sequelize.INTEGER,
        references: { model: "teachers", key: "id" },
      },
      amount: Sequelize.DECIMAL,
      payment_date: Sequelize.DATE,
      month: Sequelize.STRING,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("salary_payments");
  },
};