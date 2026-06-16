const { Circular } = require('../models');
const { key, uploadBuffer, deleteObject, publicUrl, PUBLIC_BUCKET } = require('../utils/s3');

const fmt = (c) => ({
  id: c.id,
  title: c.title,
  category: c.category,
  url: publicUrl(c.file_key),
  createdAt: c.created_at,
});

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

// ── Public: list circulars (no auth) ──────────────────────────────────────────
const listCirculars = async (req, res) => {
  try {
    const circulars = await Circular.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, circulars: circulars.map(fmt) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch circulars' });
  }
};

// ── Admin: upload a circular (PDF) ────────────────────────────────────────────
const uploadCircular = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { title, category } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    // PDFs are stored as-is (size-capped by multer at 10MB); no server-side compression.
    const objectKey = key('circulars', `${Date.now()}_${slug(title)}.pdf`);
    await uploadBuffer({ bucket: PUBLIC_BUCKET, key: objectKey, body: req.file.buffer, contentType: 'application/pdf' });

    const circular = await Circular.create({ title, category: category || null, file_key: objectKey });
    res.json({ success: true, circular: fmt(circular) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to upload circular' });
  }
};

// ── Admin: delete a circular ──────────────────────────────────────────────────
const deleteCircular = async (req, res) => {
  try {
    const circular = await Circular.findByPk(req.params.id);
    if (!circular) return res.status(404).json({ success: false, message: 'Circular not found' });

    try { await deleteObject({ bucket: PUBLIC_BUCKET, key: circular.file_key }); } catch (_) {}
    await circular.destroy();
    res.json({ success: true, message: 'Circular deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete circular' });
  }
};

module.exports = { listCirculars, uploadCircular, deleteCircular };
