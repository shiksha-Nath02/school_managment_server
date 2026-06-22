'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'e.g. "2026-27"'
      },
      start_month: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Month number 1-12 (e.g. 4 for April)'
      },
      start_year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      end_month: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Auto-calculated: start_month - 1 (wraps to 12)'
      },
      end_year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      excluded_months: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
        comment: 'Array of month numbers excluded from billing, e.g. [5, 6] for May-June vacation'
      },
      fine_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      fine_per_day: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Daily fine amount in rupees'
      },
      grace_period_days: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 10,
        comment: 'Days after month start before fine kicks in'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Only one session should be active at a time'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Admin user ID who created this session'
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sessions');
  }
};
