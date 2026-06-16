const router = require('express').Router();
const { pdfUpload } = require('../middlewares/upload');
const { uploadCircular, deleteCircular } = require('../controllers/circularController');

// Admin-only writes (mounted under /api/admin with the adminOnly guard).
router.post('/circulars', pdfUpload.single('file'), uploadCircular);
router.delete('/circulars/:id', deleteCircular);

module.exports = router;
