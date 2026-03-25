module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("teacher_attendance", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      teacher_id: {
        type: Sequelize.INTEGER,
        references: { model: "teachers", key: "id" },
      },
      date: Sequelize.DATEONLY,
      status: Sequelize.ENUM("present", "absent"),
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("teacher_attendance");
  },
};