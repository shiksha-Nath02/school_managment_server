const router = require('express').Router();
const { imageUpload } = require('../middlewares/upload');
const { uploadGallery, deleteGallery } = require('../controllers/galleryController');

// Admin-only writes (mounted under /api/admin with the adminOnly guard).
// Accepts many images at once under the 'files' field (one folder per upload).
router.post('/gallery', imageUpload.array('files', 40), uploadGallery);
router.delete('/gallery/:id', deleteGallery);

module.exports = router;
