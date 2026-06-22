module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('uniform_items', {
      id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      item_name:       { type: Sequelize.STRING(100), allowNull: false },
      size:            { type: Sequelize.STRING(20),  allowNull: false },
      price:           { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      units_available: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at:      { type: Sequelize.DATE, allowNull: false },
      updated_at:      { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => queryInterface.dropTable('uniform_items'),
};
