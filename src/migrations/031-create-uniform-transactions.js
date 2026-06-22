module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('uniform_transactions', {
      id:               { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      student_name:     { type: Sequelize.STRING(150), allowNull: false },
      father_phone:     { type: Sequelize.STRING(20),  allowNull: true },
      admission_number: { type: Sequelize.STRING(50),  allowNull: true },
      item_id:          { type: Sequelize.INTEGER, allowNull: false, references: { model: 'uniform_items', key: 'id' } },
      quantity:         { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      to_be_paid:       { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      paid:             { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      created_at:       { type: Sequelize.DATE, allowNull: false },
      updated_at:       { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => queryInterface.dropTable('uniform_transactions'),
};
