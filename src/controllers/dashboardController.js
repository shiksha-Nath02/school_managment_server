const { Op } = require('sequelize');
const {
  Student, Teacher, User, Class, FeePayment, TeacherAttendance,
  PaymentLog, UniformPayment, BookPayment, Expense, Attendance, Holiday,
} = require('../models');
const { istToday, istDayOfWeek } = require('../utils/dateUtils');

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
    const today = istToday(); // business "today" in IST (server may be UTC)
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
      allClasses,
      classesMarkedToday,
      holidayToday,
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
      // Today's full fee collection (not just the latest 5) so nothing paid today is hidden.
      FeePayment.findAll({
        where: { is_system_generated: false, amount_paid: { [Op.gt]: 0 }, payment_date: today },
        order: [['id', 'DESC']],
        limit: 200, // safety cap; a single day's collection won't realistically exceed this
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
      // All classes (for the "attendance done vs left today" tile).
      Class.findAll({ attributes: ['id', 'class_name', 'section'], order: [['id', 'ASC']] }),
      // Distinct classes that already have student attendance marked for today.
      Attendance.findAll({ where: { date: today }, attributes: ['class_id'], group: ['class_id'], raw: true }),
      // Is today a declared holiday? (Sundays handled separately in code.)
      Holiday.findOne({ where: { date: today } }),
    ]);

    const totalIncome = parseFloat(logIncome || 0) + parseFloat(uniformIncome || 0) + parseFloat(bookIncome || 0);
    const totalExpenditure = parseFloat(logExpenditure || 0) + parseFloat(expenseTotal || 0);

    // Today's student-attendance progress: which classes are done vs still pending.
    // Sundays and declared holidays are non-working days — no class is "pending".
    const isSunday = istDayOfWeek() === 0;
    const isHoliday = isSunday || !!holidayToday;
    const holidayReason = holidayToday ? holidayToday.reason : (isSunday ? 'Sunday' : null);

    const markedClassIds = new Set(classesMarkedToday.map((r) => r.class_id));
    const clsLabel = (c) => (c.section ? `${c.class_name}-${c.section}` : c.class_name);
    const doneClasses = allClasses.filter((c) => markedClassIds.has(c.id));
    // On a holiday nothing is pending; otherwise it's the unmarked classes.
    const pendingClasses = isHoliday ? [] : allClasses.filter((c) => !markedClassIds.has(c.id));

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
      classAttendanceToday: {
        date: today,
        isHoliday,
        holidayReason,
        totalClasses: allClasses.length,
        doneCount: doneClasses.length,
        pendingCount: pendingClasses.length,
        done: doneClasses.map((c) => ({ id: c.id, name: clsLabel(c) })),
        pending: pendingClasses.map((c) => ({ id: c.id, name: clsLabel(c) })),
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard' });
  }
};

module.exports = { getDashboard };
