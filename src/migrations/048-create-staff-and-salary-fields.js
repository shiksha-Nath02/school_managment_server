// Non-teaching staff (guards, cleaners, accountants…) live in their own table so
// they don't pollute teacher counts/attendance/class lists. Salary payments stay
// as rows in `expenses` (single ledger → shown in Expenditure + counted once in
// Profit), enriched with the payee link (teacher OR staff) and gross/deduction.
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = (await queryInterface.showAllTables()).map((t) => String(t).toLowerCase());
    if (!tables.includes('staff')) {
      await queryInterface.createTable('staff', {
        id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        name:        { type: Sequelize.STRING(150), allowNull: false },
        designation: { type: Sequelize.STRING(100), allowNull: true },
        salary:      { type: Sequelize.DECIMAL(10, 2), allowNull: true },
        phone:       { type: Sequelize.STRING(20), allowNull: true },
        is_active:   { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        created_at:  { type: Sequelize.DATE, allowNull: true },
        updated_at:  { type: Sequelize.DATE, allowNull: true },
      });
    }

    const exp = await queryInterface.describeTable('expenses');
    if (!exp.teacher_id) {
      await queryInterface.addColumn('expenses', 'teacher_id', {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'teachers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL',
      });
    }
    if (!exp.staff_id) {
      await queryInterface.addColumn('expenses', 'staff_id', {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'staff', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL',
      });
    }
    if (!exp.gross_amount) {
      await queryInterface.addColumn('expenses', 'gross_amount', { type: Sequelize.DECIMAL(10, 2), allowNull: true });
    }
    if (!exp.deduction) {
      await queryInterface.addColumn('expenses', 'deduction', { type: Sequelize.DECIMAL(10, 2), allowNull: true });
    }
  },

  async down(queryInterface) {
    const exp = await queryInterface.describeTable('expenses');
    if (exp.deduction) await queryInterface.removeColumn('expenses', 'deduction');
    if (exp.gross_amount) await queryInterface.removeColumn('expenses', 'gross_amount');
    if (exp.staff_id) await queryInterface.removeColumn('expenses', 'staff_id');
    if (exp.teacher_id) await queryInterface.removeColumn('expenses', 'teacher_id');
    await queryInterface.dropTable('staff');
  },
};
