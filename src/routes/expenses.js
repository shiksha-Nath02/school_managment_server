const express = require('express');
const { getExpenses, addExpense, deleteExpense } = require('../controllers/expenseController');
const { createHandover, getHandovers, deleteHandover, getHandoverSummary } = require('../controllers/handoverController');

// Auth/role is applied at the mount point in app.js (adminOnly = admin + superadmin).
const router = express.Router();

router.get('/expenses',     getExpenses);
router.post('/expenses',    addExpense);
router.delete('/expenses/:id', deleteExpense);

// ── Handover (end-of-day cash/online reconciliation) ──
router.get('/handovers',          getHandovers);
router.post('/handovers',         createHandover);
router.delete('/handovers/:id',   deleteHandover);
router.get('/handover-summary',   getHandoverSummary);

module.exports = router;
