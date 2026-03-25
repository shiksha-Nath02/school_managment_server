module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("students", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
      },
      class_id: {
        type: Sequelize.INTEGER,
        references: { model: "classes", key: "id" },
      },
      roll_number: Sequelize.INTEGER,
      date_of_birth: Sequelize.DATE,
      address: Sequelize.TEXT,
      admission_date: Sequelize.DATE,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("students");
  },
};