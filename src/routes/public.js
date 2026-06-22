const router = require('express').Router();
const { listGallery } = require('../controllers/galleryController');
const { listCirculars } = require('../controllers/circularController');

// Public, unauthenticated read endpoints for the school website (landing page).
router.get('/gallery', listGallery);
router.get('/circulars', listCirculars);

module.exports = router;
