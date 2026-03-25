module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("class_tasks", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      class_id: {
        type: Sequelize.INTEGER,
        references: { model: "classes", key: "id" },
      },
      teacher_id: {
        type: Sequelize.INTEGER,
        references: { model: "teachers", key: "id" },
      },
      date: Sequelize.DATEONLY,
      type: Sequelize.ENUM("homework", "classwork"),
      description: Sequelize.TEXT,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("class_tasks");
  },
};