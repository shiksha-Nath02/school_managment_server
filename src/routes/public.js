const router = require('express').Router();
const { listGallery } = require('../controllers/galleryController');
const { listCirculars } = require('../controllers/circularController');
const { submitEnquiry, getTodayBirthdays } = require('../controllers/enquiryController');

// Public, unauthenticated endpoints for the school website (landing page).
router.get('/gallery', listGallery);
router.get('/circulars', listCirculars);
router.post('/enquiry', submitEnquiry);       // prospective student/teacher enquiry form
router.get('/birthdays', getTodayBirthdays);  // today's student + teacher birthdays

module.exports = router;
