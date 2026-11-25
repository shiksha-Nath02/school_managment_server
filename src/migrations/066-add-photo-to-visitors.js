// Optional visitor photo. Stores the S3 object KEY (not a URL) in the PUBLIC
// bucket under visitors/; the app builds a CDN url via s3.publicUrl() on read.
module.exports = {
  async up(queryInterface, Sequelize) {
    const cols = await queryInterface.describeTable('visitors');
    if (!cols.photo_key) {
      await queryInterface.addColumn('visitors', 'photo_key', {
        type: Sequelize.STRING(255),
        allowNull: true,
        after: 'remarks',
      });
    }
  },

  async down(queryInterface) {
    const cols = await queryInterface.describeTable('visitors');
    if (cols.photo_key) await queryInterface.removeColumn('visitors', 'photo_key');
  },
};
