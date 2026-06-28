const { Staff, Teacher, User, Expense } = require('../models');

const fmtStaff = (s) => ({
  id:          s.id,
  name:        s.name,
  designation: s.designation,
  salary:      s.salary != null ? parseFloat(s.salary) : null,
  phone:       s.phone,
  isActive:    s.is_active,
});

// ─── Non-teaching staff CRUD ──────────────────────────────────────────────────

const getStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({ order: [['name', 'ASC']] });
    res.json({ staff: staff.map(fmtStaff) });
  } catch (e) {
    console.error('Get staff error:', e);
    res.status(500).json({ message: 'Failed to fetch staff' });
  }
};

const addStaff = async (req, res) => {
  try {
    const { name, designation, salary, phone } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const s = await Staff.create({
      name,
      designation: designation || null,
      salary: salary != null && salary !== '' ? parseFloat(salary) : null,
      phone: phone || null,
    });
    res.status(201).json({ message: 'Staff added', staff: fmtStaff(s) });
  } catch (e) {
    console.error('Add staff error:', e);
    res.status(500).json({ message: 'Failed to add staff' });
  }
};

const updateStaff = async (req, res) => {
  try {
    const s = await Staff.findByPk(req.params.id);
    if (!s) return res.status(404).json({ message: 'Staff not found' });
    const { name, designation, salary, phone, is_active } = req.body;
    await s.update({
      name:        name        ?? s.name,
      designation: designation !== undefined ? designation : s.designation,
      salary:      salary      !== undefined ? (salary !== '' && salary != null ? parseFloat(salary) : null) : s.salary,
      phone:       phone       !== undefined ? phone : s.phone,
      is_active:   is_active   !== undefined ? !!is_active : s.is_active,
    });
    res.json({ message: 'Staff updated', staff: fmtStaff(s) });
  } catch (e) {
    console.error('Update staff error:', e);
    res.status(500).json({ message: 'Failed to update staff' });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const s = await Staff.findByPk(req.params.id);
    if (!s) return res.status(404).json({ message: 'Staff not found' });
    const paid = await Expense.count({ where: { staff_id: s.id } });
    if (paid > 0) {
      // Keep salary history intact — deactivate instead of hard delete.
      await s.update({ is_active: false });
      return res.json({ message: 'Staff has salary records — marked inactive instead of deleted' });
    }
    await s.destroy();
    res.json({ message: 'Staff deleted' });
  } catch (e) {
    console.error('Delete staff error:', e);
    res.status(500).json({ message: 'Failed to delete staff' });
  }
};

// ─── Salary helpers ───────────────────────────────────────────────────────────

// Combined dropdown list for the salary form: active teachers + active staff.
const getSalaryPayees = async (req, res) => {
  try {
    const [teachers, staff] = await Promise.all([
      Teacher.findAll({ include: [{ model: User, as: 'user', attributes: ['name', 'is_active'] }] }),
      Staff.findAll({ where: { is_active: true }, order: [['name', 'ASC']] }),
    ]);
    const payees = [
      ...teachers
        .filter((t) => t.user && t.user.is_active)
        .map((t) => ({ type: 'teacher', id: t.id, name: t.user.name, salary: t.salary != null ? parseFloat(t.salary) : null, designation: t.subject || 'Teacher' }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      ...staff.map((s) => ({ type: 'staff', id: s.id, name: s.name, salary: s.salary != null ? parseFloat(s.salary) : null, designation: s.designation || 'Staff' })),
    ];
    res.json({ payees });
  } catch (e) {
    console.error('Get salary payees error:', e);
    res.status(500).json({ message: 'Failed to fetch payees' });
  }
};

// Salary payment history for one payee (teacher OR staff). Pulled from expenses.
const getSalaryHistory = async (req, res) => {
  try {
    const { teacher_id, staff_id } = req.query;
    if (!teacher_id && !staff_id) return res.status(400).json({ message: 'teacher_id or staff_id is required' });
    const where = { category: 'salary' };
    if (teacher_id) where.teacher_id = teacher_id;
    if (staff_id) where.staff_id = staff_id;
    const rows = await Expense.findAll({ where, order: [['date', 'DESC'], ['id', 'DESC']] });
    const payments = rows.map((e) => ({
      id:        e.id,
      date:      e.date,
      gross:     e.gross_amount != null ? parseFloat(e.gross_amount) : null,
      deduction: e.deduction != null ? parseFloat(e.deduction) : 0,
      amount:    parseFloat(e.amount),
      description: e.description,
    }));
    const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
    res.json({ payments, totalPaid });
  } catch (e) {
    console.error('Get salary history error:', e);
    res.status(500).json({ message: 'Failed to fetch salary history' });
  }
};

module.exports = { getStaff, addStaff, updateStaff, deleteStaff, getSalaryPayees, getSalaryHistory };
