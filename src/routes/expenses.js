const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth');
const { getExpenses, addExpense, deleteExpense } = require('../controllers/expenseController');

const router = express.Router();
router.use(authenticate, authorize('admin'));

router.get('/expenses',     getExpenses);
router.post('/expenses',    addExpense);
router.delete('/expenses/:id', deleteExpense);

module.exports = router;
