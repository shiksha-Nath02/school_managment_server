module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("expenses", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      category: Sequelize.STRING,
      amount: Sequelize.DECIMAL,
      date: Sequelize.DATE,
      description: Sequelize.TEXT,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("expenses");
  },
};