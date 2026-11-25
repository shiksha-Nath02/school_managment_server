const router = require('express').Router();
const { getVisitors, createVisitor, updateVisitor, deleteVisitor } = require('../controllers/visitorController');

// Auth/role applied at the mount point in app.js (adminOnly).
router.get('/visitors', getVisitors);
router.post('/visitors', createVisitor);
router.put('/visitors/:id', updateVisitor);
router.delete('/visitors/:id', deleteVisitor);

module.exports = router;
