const router = require('express').Router();
const { imageUpload } = require('../middlewares/upload');
const { uploadGallery, deleteGallery } = require('../controllers/galleryController');

// Admin-only writes (mounted under /api/admin with the adminOnly guard).
router.post('/gallery', imageUpload.single('file'), uploadGallery);
router.delete('/gallery/:id', deleteGallery);

module.exports = router;
