// Admission fee per student per session. The session carries the annual charge
// (sessions.admission_fee); each student gets a row with that charge, an optional
// per-student discount, and a running paid_amount. Due = annual_charge - discount
// - paid_amount. Soft-deletable (paranoid) like the other financial records.
module.exports = {
  async up(queryInterface, Sequelize) {
    // Annual admission charge for the session (new students inherit it).
    const sessionCols = await queryInterface.describeTable('sessions');
    if (!sessionCols.admission_fee) {
      await queryInterface.addColumn('sessions', 'admission_fee', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      });
    }

    await queryInterface.createTable('admission_fees', {
      id:            { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      student_id:    { type: Sequelize.INTEGER, allowNull: false,
                       references: { model: 'students', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      session_id:    { type: Sequelize.INTEGER, allowNull: false,
                       references: { model: 'sessions', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      annual_charge: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      discount:      { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      paid_amount:   { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      // true = assumed settled before tracking began (pre-July April money, NOT in
      // profit). A real payment flips this to false and records actual profit.
      assumed_paid:  { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at:    { type: Sequelize.DATE, allowNull: false },
      updated_at:    { type: Sequelize.DATE, allowNull: false },
      deleted_at:    { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('admission_fees', ['student_id', 'session_id'], {
      unique: true,
      name: 'unique_student_session_admission',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('admission_fees');
    const sessionCols = await queryInterface.describeTable('sessions');
    if (sessionCols.admission_fee) await queryInterface.removeColumn('sessions', 'admission_fee');
  },
};
