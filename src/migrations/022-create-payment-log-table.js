'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_log', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'fees, fine, stationery, salary, pantry, books, uniform, maintenance, etc.'
      },
      direction: {
        type: Sequelize.ENUM('income', 'expenditure'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Positive for normal entries, negative for reversals'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Details — e.g. "Fee payment by Aadhya Mishra (Class 1-A)"'
      },
      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Links to fee_payments.id for fee-related entries, salary_payments.id for salary, etc.'
      },
      reference_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Table name: "fee_payments", "salary_payments", "expenses", etc.'
      },
      recorded_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Admin user ID'
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

    await queryInterface.addIndex('payment_log', ['direction', 'date'], {
      name: 'idx_direction_date'
    });

    await queryInterface.addIndex('payment_log', ['type', 'date'], {
      name: 'idx_type_date'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payment_log');
  }
};
