// School-wide holiday calendar. A date listed here is a non-working day: the
// dashboard won't flag any class as "attendance pending" on it, and attendance
// stats can exclude it. Sundays are treated as holidays by default in code and
// are NOT stored here (only explicit, admin-declared holidays live in this table).
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('holidays', {
      id:         { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      date:       { type: Sequelize.DATEONLY, allowNull: false, unique: true },
      reason:     { type: Sequelize.STRING(255), allowNull: false },
      created_by: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('holidays', ['date']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('holidays');
  },
};
