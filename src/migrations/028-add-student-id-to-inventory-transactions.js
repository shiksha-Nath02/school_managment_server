'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inventory_transactions', 'student_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'students', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      after: 'item_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('inventory_transactions', 'student_id');
  },
};
