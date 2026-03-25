module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("attendance", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      student_id: {
        type: Sequelize.INTEGER,
        references: { model: "students", key: "id" },
      },
      class_id: {
        type: Sequelize.INTEGER,
        references: { model: "classes", key: "id" },
      },
      date: Sequelize.DATEONLY,
      status: Sequelize.ENUM("present", "absent"),
      marked_by_teacher: {
        type: Sequelize.INTEGER,
        references: { model: "teachers", key: "id" },
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("attendance");
  },
};