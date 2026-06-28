const { GalleryImage } = require('../models');
const { key, uploadBuffer, deleteObject, publicUrl, PUBLIC_BUCKET } = require('../utils/s3');
const { compressImage } = require('../utils/imageCompress');

const fmt = (g) => ({
  id: g.id,
  category: g.category,
  caption: g.caption,
  url: publicUrl(g.image_key),
  createdAt: g.created_at,
});

// ── Public: list gallery images (no auth) ────────────────────────────────────
const listGallery = async (req, res) => {
  try {
    const where = {};
    if (req.query.category) where.category = req.query.category;
    const images = await GalleryImage.findAll({ where, order: [['created_at', 'DESC']] });
    res.json({ success: true, images: images.map(fmt) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch gallery' });
  }
};

// ── Admin: upload one or many images into a folder (category) ─────────────────
const uploadGallery = async (req, res) => {
  try {
    const files = req.files && req.files.length ? req.files : (req.file ? [req.file] : []);
    if (!files.length) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { category, caption } = req.body;
    if (!category || !category.trim()) return res.status(400).json({ success: false, message: 'Folder name is required' });
    const folder = category.trim();

    const created = [];
    for (let i = 0; i < files.length; i++) {
      const { buffer, contentType } = await compressImage(files[i].buffer);
      const objectKey = key('gallery', `${folder}_${Date.now()}_${i}.jpg`);
      await uploadBuffer({ bucket: PUBLIC_BUCKET, key: objectKey, body: buffer, contentType });
      const image = await GalleryImage.create({ category: folder, image_key: objectKey, caption: caption || null });
      created.push(fmt(image));
    }
    res.json({ success: true, images: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to upload image(s)' });
  }
};

// ── Admin: delete a gallery image ─────────────────────────────────────────────
const deleteGallery = async (req, res) => {
  try {
    const image = await GalleryImage.findByPk(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

    try { await deleteObject({ bucket: PUBLIC_BUCKET, key: image.image_key }); } catch (_) {}
    await image.destroy();
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete image' });
  }
};

module.exports = { listGallery, uploadGallery, deleteGallery };
