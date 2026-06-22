// Early tables (005 timetable, 006 attendance, 009 class_tasks, 013 inventory)
// were created without created_at / updated_at, but their Sequelize models
// declare `timestamps: true`. Sequelize therefore SELECTs created_at AS createdAt
// and MySQL throws ER_BAD_FIELD_ERROR ("Unknown column 'created_at'").
// This adds the missing columns. Idempotent: guarded by describeTable so it is
// safe to run even if a column already exists.
const TABLES = ['timetable', 'attendance', 'class_tasks', 'inventory'];

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of TABLES) {
      const columns = await queryInterface.describeTable(table);
      if (!columns.created_at) {
        await queryInterface.addColumn(table, 'created_at', {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        });
      }
      if (!columns.updated_at) {
        await queryInterface.addColumn(table, 'updated_at', {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        });
      }
    }
  },

  async down(queryInterface) {
    for (const table of TABLES) {
      const columns = await queryInterface.describeTable(table);
      if (columns.updated_at) await queryInterface.removeColumn(table, 'updated_at');
      if (columns.created_at) await queryInterface.removeColumn(table, 'created_at');
    }
  },
};
