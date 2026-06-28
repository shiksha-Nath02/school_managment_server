const router = require('express').Router();
const { getEnquiries, updateEnquiry, deleteEnquiry } = require('../controllers/enquiryController');

// Auth/role applied at the mount point in app.js (adminOnly).
router.get('/enquiries', getEnquiries);
router.put('/enquiries/:id', updateEnquiry);
router.delete('/enquiries/:id', deleteEnquiry);

module.exports = router;
