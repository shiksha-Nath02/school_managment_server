const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GalleryImage = sequelize.define('GalleryImage', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  category: { type: DataTypes.STRING(100), allowNull: false },
  image_key: { type: DataTypes.STRING(500), allowNull: false },
  caption: { type: DataTypes.STRING(255), allowNull: true },
}, {
  tableName: 'gallery_images',
  underscored: true,
});

module.exports = GalleryImage;
