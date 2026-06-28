// Public website enquiries (admission interest from prospective students, and
// job interest from prospective teachers). One row per submitted enquiry form.
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = (await queryInterface.showAllTables()).map((t) => String(t).toLowerCase());
    if (tables.includes('enquiries')) return;
    await queryInterface.createTable('enquiries', {
      id:         { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      type:       { type: Sequelize.ENUM('student', 'teacher'), allowNull: false },
      name:       { type: Sequelize.STRING(150), allowNull: false },
      email:      { type: Sequelize.STRING(150), allowNull: true },
      phone:      { type: Sequelize.STRING(20), allowNull: true },
      detail:     { type: Sequelize.STRING(150), allowNull: true }, // class applying (student) / subject/position (teacher)
      message:    { type: Sequelize.TEXT, allowNull: true },
      status:     { type: Sequelize.ENUM('new', 'contacted', 'closed'), allowNull: false, defaultValue: 'new' },
      created_at: { type: Sequelize.DATE, allowNull: true },
      updated_at: { type: Sequelize.DATE, allowNull: true },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('enquiries');
  },
};
