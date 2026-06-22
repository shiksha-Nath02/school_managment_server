module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('book_items', {
      id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      book_name:       { type: Sequelize.STRING(200), allowNull: false },
      class_name:      { type: Sequelize.STRING(50),  allowNull: true },
      subject:         { type: Sequelize.STRING(100), allowNull: true },
      price:           { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      units_available: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at:      { type: Sequelize.DATE, allowNull: false },
      updated_at:      { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => queryInterface.dropTable('book_items'),
};
