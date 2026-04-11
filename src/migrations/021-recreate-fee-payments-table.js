'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop old empty fee_payments table
    await queryInterface.dropTable('fee_payments');

    await queryInterface.createTable('fee_payments', {
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
      billing_month: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Month number 1-12'
      },
      billing_year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      amount_paid: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      fine_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Fine locked in at time of payment'
      },
      pending_after: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Running pending balance after this entry'
      },
      payment_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'NULL for system-generated gap rows'
      },
      payment_method: {
        type: Sequelize.ENUM('cash', 'upi', 'cheque', 'bank_transfer', 'online'),
        allowNull: true,
        comment: 'NULL for system-generated gap rows'
      },
      receipt_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        comment: 'Auto-generated: REC-2627-0001 or REV-2627-0001 for reversals'
      },
      is_system_generated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'True for auto-filled gap rows with 0 payment'
      },
      is_reversal: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      reversal_for: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'fee_payments', key: 'id' },
        comment: 'Points to original payment ID if this is a reversal'
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      received_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Admin user ID who recorded this payment'
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

    // Index for quick lookups by student + chronological order
    await queryInterface.addIndex('fee_payments', ['student_id', 'billing_year', 'billing_month'], {
      name: 'idx_student_billing_period'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('fee_payments');

    // Recreate original fee_payments table
    await queryInterface.createTable('fee_payments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      student_id: { type: Sequelize.INTEGER },
      amount: { type: Sequelize.DECIMAL(10, 2) },
      payment_date: { type: Sequelize.DATEONLY },
      payment_method: { type: Sequelize.STRING }
    });
  }
};
