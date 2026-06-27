const { Op } = require('sequelize');
const {
  Student, Teacher, User, Class, FeePayment, TeacherAttendance,
  PaymentLog, UniformPayment, BookPayment, Expense,
} = require('../models');

// Derive a Paid/Partial/Due label from a fee payment row.
const paymentStatus = (row) => {
  const pending = parseFloat(row.pending_after);
  const paid = parseFloat(row.amount_paid);
  if (pending <= 0) return 'Paid';
  if (paid > 0) return 'Partial';
  return 'Due';
};

// ──────────────────────────────────────────────────
// ADMIN DASHBOARD OVERVIEW
// GET /api/admin/dashboard
// Aggregates: total students, total teachers, fee collected (this month),
// net profit (this month), recent fee payments, teacher attendance today.
// ──────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];
    const monthRange = { [Op.between]: [monthStart, monthEnd] };

    const [
      totalStudents,
      totalTeachers,
      feeCollectedMonth,
      logIncome,
      logExpenditure,
      uniformIncome,
      bookIncome,
      expenseTotal,
      recentRows,
      attendanceRecords,
    ] = await Promise.all([
      Student.count({ where: { status: { [Op.in]: ['active', 'promoted'] } } }),
      Teacher.count({
        include: [{ model: User, as: 'user', where: { is_active: true }, attributes: [] }],
      }),
      // Fee collected this month = fees + fine income recorded in the ledger
      PaymentLog.sum('amount', {
        where: { type: { [Op.in]: ['fees', 'fine'] }, direction: 'income', date: monthRange },
      }),
      // Net-profit sources for the month (mirrors getProfitReport)
      PaymentLog.sum('amount', { where: { direction: 'income', date: monthRange } }),
      PaymentLog.sum('amount', { where: { direction: 'expenditure', date: monthRange } }),
      UniformPayment.sum('amount_paid', { where: { payment_date: monthRange } }),
      BookPayment.sum('amount_paid', { where: { payment_date: monthRange } }),
      // All expenditure reasons (stationary, pantry, inventory, salary, …).
      Expense.sum('amount', { where: { date: monthRange } }),
      FeePayment.findAll({
        where: { is_system_generated: false, amount_paid: { [Op.gt]: 0 } },
        order: [['payment_date', 'DESC'], ['id', 'DESC']],
        limit: 5,
        include: [{
          model: Student,
          as: 'student',
          include: [
            { model: User, as: 'user', attributes: ['name'] },
            { model: Class, as: 'class', attributes: ['class_name', 'section'] },
          ],
        }],
      }),
      TeacherAttendance.findAll({
        where: { date: today },
        include: [{ model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['name'] }] }],
        order: [['id', 'ASC']],
      }),
    ]);

    const totalIncome = parseFloat(logIncome || 0) + parseFloat(uniformIncome || 0) + parseFloat(bookIncome || 0);
    const totalExpenditure = parseFloat(logExpenditure || 0) + parseFloat(expenseTotal || 0);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        feeCollectedMonth: parseFloat(feeCollectedMonth || 0),
        netProfitMonth: totalIncome - totalExpenditure,
      },
      recentPayments: recentRows.map((r) => ({
        id: r.id,
        name: r.student?.user?.name || 'Unknown',
        class: r.student?.class ? `${r.student.class.class_name}-${r.student.class.section}` : null,
        amount: parseFloat(r.amount_paid),
        status: paymentStatus(r),
        date: r.payment_date,
      })),
      teacherAttendanceToday: attendanceRecords.map((r) => ({
        id: r.id,
        name: r.teacher?.user?.name || 'Unknown',
        status: r.status,
        checkInTime: r.check_in_time || null,
      })),
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard' });
  }
};

module.exports = { getDashboard };
