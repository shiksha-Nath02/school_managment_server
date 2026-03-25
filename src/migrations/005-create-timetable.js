module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("timetable", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      class_id: {
        type: Sequelize.INTEGER,
        references: { model: "classes", key: "id" },
      },
      subject: Sequelize.STRING,
      teacher_id: {
        type: Sequelize.INTEGER,
        references: { model: "teachers", key: "id" },
      },
      day: Sequelize.STRING,
      period: Sequelize.INTEGER,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("timetable");
  },
};