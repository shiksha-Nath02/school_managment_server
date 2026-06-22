module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory_transactions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'inventory', key: 'id' },
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('purchase', 'sale', 'distribute'),
        allowNull: false,
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      total_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      reference_note: { type: Sequelize.TEXT, allowNull: true },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('inventory_transactions');
  },
};
