const { Op } = require('sequelize');
const Expense = require('../models/Expense');

// Allowed expenditure reasons (category is the stored key).
const REASONS = ['stationary', 'pantry', 'inventory', 'salary'];

const getExpenses = async (req, res) => {
  try {
    const { category, from, to } = req.query;
    const where = {};
    if (category) where.category = category;
    if (from || to) {
      where.date = {};
      if (from) where.date[Op.gte] = from;
      if (to) where.date[Op.lte] = to;
    }
    const expenses = await Expense.findAll({
      where,
      order: [['date', 'DESC'], ['id', 'DESC']],
    });
    const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
    res.json({ expenses: expenses.map(fmt), total });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
};

const addExpense = async (req, res) => {
  try {
    const { category, description, amount, date } = req.body;
    if (!category || !amount || !date) return res.status(400).json({ message: 'category (reason), amount, and date are required' });
    if (!REASONS.includes(category)) return res.status(400).json({ message: `Invalid reason. Allowed: ${REASONS.join(', ')}` });
    const expense = await Expense.create({
      category,
      description: description || null,
      amount:      parseFloat(amount),
      date,
    });
    res.status(201).json({ message: 'Expense added', expense: fmt(expense) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to add expense' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    await expense.destroy();
    res.json({ message: 'Expense deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete expense' });
  }
};

function fmt(e) {
  return {
    id:          e.id,
    category:    e.category,
    description: e.description,
    amount:      parseFloat(e.amount),
    date:        e.date,
  };
}

module.exports = { getExpenses, addExpense, deleteExpense };
