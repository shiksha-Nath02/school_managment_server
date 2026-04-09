const express = require('express');
const router = express.Router();
const { User } = require('../models');
const {
  getMyAttendance,
  getAttendanceSummary,
} = require('../controllers/studentController');

// Dev bypass: inject first student user so controllers can use req.user.id
router.use(async (req, res, next) => {
  try {
    req.user = await User.findOne({ where: { role: 'student' } });
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/attendance', getMyAttendance);
router.get('/attendance/summary', getAttendanceSummary);

module.exports = router;
