const { Op } = require('sequelize');
const Expense = require('../models/Expense');

// Allowed expenditure reasons (category is the stored key).
const REASONS = ['stationary', 'pantry', 'inventory', 'salary', 'other'];

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
    const { category, description, amount, date, teacher_id, staff_id, gross_amount, deduction, payment_method } = req.body;
    if (!category || !amount || !date) return res.status(400).json({ message: 'category (reason), amount, and date are required' });
    if (!REASONS.includes(category)) return res.status(400).json({ message: `Invalid reason. Allowed: ${REASONS.join(', ')}` });

    const method = payment_method === 'online' ? 'online' : 'cash'; // default cash

    const isSalary = category === 'salary';
    if (isSalary && !teacher_id && !staff_id) {
      return res.status(400).json({ message: 'Select a teacher or staff member for a salary payment' });
    }

    const expense = await Expense.create({
      category,
      description: description || null,
      amount:      parseFloat(amount), // final/net amount paid
      payment_method: method,
      date,
      // Salary-only fields; null for every other reason.
      teacher_id:   isSalary ? (teacher_id || null) : null,
      staff_id:     isSalary ? (staff_id || null) : null,
      gross_amount: isSalary && gross_amount != null && gross_amount !== '' ? parseFloat(gross_amount) : null,
      deduction:    isSalary && deduction    != null && deduction    !== '' ? parseFloat(deduction)    : null,
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

// Normalise the date to a plain YYYY-MM-DD. The column is DATEONLY but the
// driver hands back a Date object here, which serialises to a full ISO
// timestamp — that broke client-side date-range filtering (the longer
// timestamp string sorted past the "to" date, dropping same-day rows).
const ymd = (d) => {
  if (!d) return null;
  if (typeof d === 'string') return d.slice(0, 10);
  return new Date(d).toISOString().slice(0, 10);
};

function fmt(e) {
  return {
    id:          e.id,
    category:    e.category,
    description: e.description,
    amount:      parseFloat(e.amount),
    payment_method: e.payment_method || 'cash',
    date:        ymd(e.date),
    teacherId:   e.teacher_id || null,
    staffId:     e.staff_id || null,
    gross:       e.gross_amount != null ? parseFloat(e.gross_amount) : null,
    deduction:   e.deduction != null ? parseFloat(e.deduction) : null,
  };
}

module.exports = { getExpenses, addExpense, deleteExpense };
