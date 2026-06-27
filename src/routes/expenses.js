const express = require('express');
const { getExpenses, addExpense, deleteExpense } = require('../controllers/expenseController');

// Auth/role is applied at the mount point in app.js (adminOnly = admin + superadmin).
const router = express.Router();

router.get('/expenses',     getExpenses);
router.post('/expenses',    addExpense);
router.delete('/expenses/:id', deleteExpense);

module.exports = router;
