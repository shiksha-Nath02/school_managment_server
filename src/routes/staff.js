const router = require('express').Router();
const {
  getStaff, addStaff, updateStaff, deleteStaff,
  getSalaryPayees, getSalaryHistory,
} = require('../controllers/staffController');

// Auth/role applied at the mount point in app.js (adminOnly).
router.get('/staff', getStaff);
router.post('/staff', addStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);

// Salary helpers (payee dropdown + per-payee history)
router.get('/salary-payees', getSalaryPayees);
router.get('/salary-history', getSalaryHistory);

module.exports = router;
