module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("inventory", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      item_name: Sequelize.STRING,
      category: Sequelize.ENUM(
        "uniform",
        "books",
        "stationary",
        "pantry"
      ),
      quantity: Sequelize.INTEGER,
      price: Sequelize.DECIMAL,
      last_updated: Sequelize.DATE,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("inventory");
  },
};