module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("classes", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      class_name: Sequelize.STRING,
      section: Sequelize.STRING,
      class_teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("classes");
  },
};