module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("marks", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      student_id: {
        type: Sequelize.INTEGER,
        references: { model: "students", key: "id" },
      },
      class_id: {
        type: Sequelize.INTEGER,
        references: { model: "classes", key: "id" },
      },
      subject: Sequelize.STRING,
      exam_type: Sequelize.STRING,
      marks_obtained: Sequelize.FLOAT,
      max_marks: Sequelize.FLOAT,
      uploaded_by: {
        type: Sequelize.INTEGER,
        references: { model: "teachers", key: "id" },
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("marks");
  },
};