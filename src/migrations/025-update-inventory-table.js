module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inventory', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'price',
    });
    await queryInterface.addColumn('inventory', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      after: 'description',
    });
    await queryInterface.addColumn('inventory', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      after: 'created_at',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('inventory', 'description');
    await queryInterface.removeColumn('inventory', 'created_at');
    await queryInterface.removeColumn('inventory', 'updated_at');
  },
};
