const { FeePayment, StudentFee, Session, Student } = require('../models');
const { Op } = require('sequelize');

/**
 * Get the session that a given month/year belongs to.
 */
const getSessionForMonth = async (month, year) => {
  const sessions = await Session.findAll({
    order: [['start_year', 'ASC'], ['start_month', 'ASC']]
  });

  for (const session of sessions) {
    const startVal = session.start_year * 12 + session.start_month;
    const endVal = session.end_year * 12 + session.end_month;
    const checkVal = year * 12 + month;

    if (checkVal >= startVal && checkVal <= endVal) {
      return session;
    }
  }
  return null;
};

/**
 * Get a student's monthly fee config for a given session.
 */
const getStudentFeeForSession = async (studentId, sessionId) => {
  return await StudentFee.findOne({
    where: { student_id: studentId, session_id: sessionId }
  });
};

/**
 * Check if a month is excluded (vacation) in a session.
 */
const isExcludedMonth = (month, session) => {
  const excluded = session.excluded_months || [];
  return excluded.includes(month);
};

/**
 * Get the last fee payment row for a student (chronologically).
 */
const getLastPaymentRow = async (studentId) => {
  return await FeePayment.findOne({
    where: { student_id: studentId },
    order: [['billing_year', 'DESC'], ['billing_month', 'DESC'], ['id', 'DESC']]
  });
};

/**
 * Get the last fee payment row BEFORE a specific month/year.
 */
const getLastPaymentBefore = async (studentId, month, year) => {
  return await FeePayment.findOne({
    where: {
      student_id: studentId,
      [Op.or]: [
        { billing_year: { [Op.lt]: year } },
        { billing_year: year, billing_month: { [Op.lt]: month } }
      ]
    },
    order: [['billing_year', 'DESC'], ['billing_month', 'DESC'], ['id', 'DESC']]
  });
};

/**
 * Advance month by 1 (handles Dec→Jan year wrap).
 */
const nextMonth = (month, year) => {
  if (month === 12) return { month: 1, year: year + 1 };
  return { month: month + 1, year };
};

/**
 * Calculate months elapsed between two billing periods.
 */
const monthsElapsed = (fromMonth, fromYear, toMonth, toYear) => {
  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
};

/**
 * Generate gap rows for months between lastMonth/lastYear and targetMonth/targetYear.
 * Does NOT include the target month itself.
 * Returns { gapRows, runningPending }.
 */
const generateGapRows = async (studentId, lastMonth, lastYear, lastPending, targetMonth, targetYear) => {
  const gapRows = [];
  let current = nextMonth(lastMonth, lastYear);
  let runningPending = parseFloat(lastPending);

  while (current.year < targetYear || (current.year === targetYear && current.month < targetMonth)) {
    const session = await getSessionForMonth(current.month, current.year);

    if (session && !isExcludedMonth(current.month, session)) {
      const feeConfig = await getStudentFeeForSession(studentId, session.id);
      const monthlyFee = feeConfig ? parseFloat(feeConfig.monthly_fee) : 0;
      const discount = feeConfig ? parseFloat(feeConfig.discount) : 0;

      runningPending = runningPending + monthlyFee - discount;

      gapRows.push({
        student_id: studentId,
        billing_month: current.month,
        billing_year: current.year,
        amount_paid: 0,
        fine_amount: 0,
        pending_after: runningPending,
        payment_date: null,
        payment_method: null,
        receipt_number: null,
        is_system_generated: true,
        is_reversal: false,
        reversal_for: null,
        remarks: 'Auto-generated: no payment received',
        received_by: null
      });
    }

    current = nextMonth(current.month, current.year);
  }

  return { gapRows, runningPending };
};

/**
 * Generate receipt number.
 * Format: REC-2627-0001 or REV-2627-0001
 */
const generateReceiptNumber = async (sessionName, isReversal = false) => {
  const prefix = isReversal ? 'REV' : 'REC';
  const sessionCode = sessionName.replace('-', '');

  const lastReceipt = await FeePayment.findOne({
    where: {
      receipt_number: {
        [Op.like]: `${prefix}-${sessionCode}-%`
      }
    },
    order: [['id', 'DESC']]
  });

  let nextNum = 1;
  if (lastReceipt && lastReceipt.receipt_number) {
    const parts = lastReceipt.receipt_number.split('-');
    nextNum = parseInt(parts[2]) + 1;
  }

  return `${prefix}-${sessionCode}-${String(nextNum).padStart(4, '0')}`;
};

/**
 * Calculate dynamic fine for a student's current pending.
 */
const calculateFine = async (studentId) => {
  const lastRow = await getLastPaymentRow(studentId);
  if (!lastRow || parseFloat(lastRow.pending_after) <= 0) {
    return { fine: 0, daysLate: 0, finePerDay: 0 };
  }

  const session = await getSessionForMonth(lastRow.billing_month, lastRow.billing_year);
  if (!session || !session.fine_enabled) {
    return { fine: 0, daysLate: 0, finePerDay: 0 };
  }

  // Find the earliest month with pending > 0
  const firstUnpaidRow = await FeePayment.findOne({
    where: {
      student_id: studentId,
      pending_after: { [Op.gt]: 0 }
    },
    order: [['billing_year', 'ASC'], ['billing_month', 'ASC'], ['id', 'ASC']]
  });

  if (!firstUnpaidRow) {
    return { fine: 0, daysLate: 0, finePerDay: 0 };
  }

  // Grace period starts from the 1st of the first unpaid billing month
  const dueDate = new Date(firstUnpaidRow.billing_year, firstUnpaidRow.billing_month - 1, 1);
  const graceEnd = new Date(dueDate);
  graceEnd.setDate(graceEnd.getDate() + session.grace_period_days);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (today <= graceEnd) {
    return { fine: 0, daysLate: 0, finePerDay: parseFloat(session.fine_per_day) };
  }

  const daysLate = Math.floor((today - graceEnd) / (1000 * 60 * 60 * 24));
  const fine = daysLate * parseFloat(session.fine_per_day);

  return { fine, daysLate, finePerDay: parseFloat(session.fine_per_day) };
};

/**
 * Recalculate all pending amounts for a student from a given point onwards.
 * Used after backdated payments, reversals, or fee edits.
 */
const recalculateChain = async (studentId, fromMonth, fromYear, transaction) => {
  const txnOpts = transaction ? { transaction } : {};

  // Get the pending just before the starting point
  const prevRow = await getLastPaymentBefore(studentId, fromMonth, fromYear);
  let runningPending = prevRow ? parseFloat(prevRow.pending_after) : 0;
  let prevMonth = prevRow ? prevRow.billing_month : null;
  let prevYear = prevRow ? prevRow.billing_year : null;

  // If no previous row, start from one month before admission
  if (!prevRow) {
    const student = await Student.findByPk(studentId);
    if (student && student.admission_date) {
      const admDate = new Date(student.admission_date);
      prevMonth = admDate.getMonth() + 1;
      prevYear = admDate.getFullYear();
      // Go one month back so the first billing month's fee is included
      const prev = prevMonth === 1
        ? { month: 12, year: prevYear - 1 }
        : { month: prevMonth - 1, year: prevYear };
      prevMonth = prev.month;
      prevYear = prev.year;
    }
  }

  // Get all rows from the starting point onwards
  const rows = await FeePayment.findAll({
    where: {
      student_id: studentId,
      [Op.or]: [
        { billing_year: { [Op.gt]: fromYear } },
        { billing_year: fromYear, billing_month: { [Op.gte]: fromMonth } }
      ]
    },
    order: [['billing_year', 'ASC'], ['billing_month', 'ASC'], ['id', 'ASC']],
    ...txnOpts
  });

  for (const row of rows) {
    // Add fees for each billable month from prevMonth+1 up to this row's billing month
    if (prevMonth !== null) {
      let cur = nextMonth(prevMonth, prevYear);
      while (cur.year < row.billing_year || (cur.year === row.billing_year && cur.month <= row.billing_month)) {
        const session = await getSessionForMonth(cur.month, cur.year);
        if (session && !isExcludedMonth(cur.month, session)) {
          const feeConfig = await getStudentFeeForSession(studentId, session.id);
          const monthlyFee = feeConfig ? parseFloat(feeConfig.monthly_fee) : 0;
          const discount = feeConfig ? parseFloat(feeConfig.discount) : 0;
          runningPending += monthlyFee - discount;
        }
        if (cur.year === row.billing_year && cur.month === row.billing_month) break;
        cur = nextMonth(cur.month, cur.year);
      }
    }

    // Subtract the payment (negative amount_paid for reversals adds back)
    runningPending -= parseFloat(row.amount_paid);

    await row.update({ pending_after: runningPending }, txnOpts);

    prevMonth = row.billing_month;
    prevYear = row.billing_year;
  }
};

module.exports = {
  getSessionForMonth,
  getStudentFeeForSession,
  isExcludedMonth,
  getLastPaymentRow,
  getLastPaymentBefore,
  nextMonth,
  monthsElapsed,
  generateGapRows,
  generateReceiptNumber,
  calculateFine,
  recalculateChain
};
