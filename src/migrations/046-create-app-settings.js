// Generic per-school key/value settings table (one row per setting).
// Each school runs its own DB, so no school identifier is needed.
// First use: persisting the daily self-attendance toggle across restarts.
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.map((t) => String(t).toLowerCase()).includes('app_settings')) return;
    await queryInterface.createTable('app_settings', {
      id:            { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      setting_key:   { type: Sequelize.STRING(100), allowNull: false, unique: true },
      setting_value: { type: Sequelize.TEXT, allowNull: true },
      updated_at:    { type: Sequelize.DATE, allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('app_settings');
  },
};
