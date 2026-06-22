'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop old empty fees table
    await queryInterface.dropTable('fees');

    // Create new student_fees table — one row per student per session
    await queryInterface.createTable('student_fees', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'students', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sessions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      monthly_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Individual monthly fee for this student in this session'
      },
      discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Monthly discount (scholarship/waiver). Effective fee = monthly_fee - discount'
      },
      discount_reason: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'e.g. "Sibling discount", "Merit scholarship", "Staff ward"'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // One fee config per student per session
    await queryInterface.addIndex('student_fees', ['student_id', 'session_id'], {
      unique: true,
      name: 'unique_student_session_fee'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student_fees');

    // Recreate original fees table structure
    await queryInterface.createTable('fees', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      student_id: { type: Sequelize.INTEGER },
      total_fee: { type: Sequelize.DECIMAL(10, 2) },
      paid_amount: { type: Sequelize.DECIMAL(10, 2) },
      due_amount: { type: Sequelize.DECIMAL(10, 2) },
      last_payment_date: { type: Sequelize.DATEONLY },
      discount: { type: Sequelize.DECIMAL(10, 2) }
    });
  }
};
