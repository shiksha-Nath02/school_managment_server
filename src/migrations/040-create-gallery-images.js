'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('gallery_images', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      category: { type: Sequelize.STRING(100), allowNull: false },
      image_key: { type: Sequelize.STRING(500), allowNull: false },
      caption: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('gallery_images');
  },
};
