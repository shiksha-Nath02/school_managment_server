'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('class_tasks', 'type');
    await queryInterface.removeColumn('class_tasks', 'description');

    await queryInterface.addColumn('class_tasks', 'tasks_data', {
      type: Sequelize.JSON,
      allowNull: false,
      comment: 'JSON array of {period, subject, classwork, homework} for the day'
    });

    const tableDesc = await queryInterface.describeTable('class_tasks');

    if (!tableDesc.created_at) {
      await queryInterface.addColumn('class_tasks', 'created_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }

    if (!tableDesc.updated_at) {
      await queryInterface.addColumn('class_tasks', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      });
    }

    await queryInterface.addIndex('class_tasks', ['class_id', 'date'], {
      unique: true,
      name: 'unique_class_date'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('class_tasks', 'unique_class_date');
    await queryInterface.removeColumn('class_tasks', 'tasks_data');

    await queryInterface.addColumn('class_tasks', 'type', {
      type: Sequelize.ENUM('homework', 'classwork'),
      allowNull: true
    });
    await queryInterface.addColumn('class_tasks', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  }
};
