// Front-desk visitor register. One row per visitor logged at the gate/reception.
// Admin-entered (no public submission). time_out stays null until the visitor
// is checked out.
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = (await queryInterface.showAllTables()).map((t) => String(t).toLowerCase());
    if (tables.includes('visitors')) return;
    await queryInterface.createTable('visitors', {
      id:           { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name:         { type: Sequelize.STRING(150), allowNull: false },
      phone:        { type: Sequelize.STRING(20), allowNull: true },
      purpose:      { type: Sequelize.STRING(255), allowNull: true },  // reason for the visit
      whom_to_meet: { type: Sequelize.STRING(150), allowNull: true },  // person/department they came to see
      num_persons:  { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      visit_date:   { type: Sequelize.DATEONLY, allowNull: false },    // the day of the visit (IST)
      time_in:      { type: Sequelize.DATE, allowNull: false },        // check-in timestamp
      time_out:     { type: Sequelize.DATE, allowNull: true },         // check-out timestamp (null = still in)
      remarks:      { type: Sequelize.TEXT, allowNull: true },
      created_at:   { type: Sequelize.DATE, allowNull: true },
      updated_at:   { type: Sequelize.DATE, allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('visitors');
  },
};
