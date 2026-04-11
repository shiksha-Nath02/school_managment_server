const { FeePayment, StudentFee, Student, User, Class, Session, PaymentLog } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const {
  getSessionForMonth,
  getStudentFeeForSession,
  isExcludedMonth,
  generateGapRows,
  generateReceiptNumber,
  calculateFine,
  recalculateChain
} = require('../utils/feeEngine');

// ──────────────────────────────────────────────────
// RECORD A SINGLE PAYMENT
// POST /api/admin/fees/pay
// Body: { student_id, amount, payment_date, payment_method, billing_month, billing_year, include_fine, remarks }
// ──────────────────────────────────────────────────
const recordPayment = async (req, res) => {
  const txn = await sequelize.transaction();
  try {
    const { student_id, amount, payment_date, payment_method, billing_month, billing_year, include_fine, remarks } = req.body;

    if (!student_id || amount == null || !payment_date || !payment_method || !billing_month || !billing_year) {
      await txn.rollback();
      return res.status(400).json({ success: false, message: 'student_id, amount, payment_date, payment_method, billing_month, billing_year are required' });
    }

    // Lock: get student's last payment row with row lock
    const lastRow = await FeePayment.findOne({
      where: { student_id },
      order: [['billing_year', 'DESC'], ['billing_month', 'DESC'], ['id', 'DESC']],
      lock: txn.LOCK.UPDATE,
      transaction: txn
    });

    let lastPending = 0;
    let lastMonth = null;
    let lastYear = null;

    if (lastRow) {
      lastPending = parseFloat(lastRow.pending_after);
      lastMonth = lastRow.billing_month;
      lastYear = lastRow.billing_year;
    } else {
      // First payment — start gap generation from month before admission
      const student = await Student.findByPk(student_id, { transaction: txn });
      if (student && student.admission_date) {
        const admDate = new Date(student.admission_date);
        lastMonth = admDate.getMonth() + 1;
        lastYear = admDate.getFullYear();
        if (lastMonth === 1) { lastMonth = 12; lastYear -= 1; }
        else { lastMonth -= 1; }
      }
    }

    // Check if this is a backdated payment
    const isBackdated = lastRow && (
      billing_year < lastRow.billing_year ||
      (billing_year === lastRow.billing_year && billing_month < lastRow.billing_month)
    );

    if (isBackdated) {
      const session = await getSessionForMonth(billing_month, billing_year);
      const sessionName = session ? session.name : 'UNKNOWN';
      const receiptNum = await generateReceiptNumber(sessionName, false);

      let fineAmount = 0;
      if (include_fine) {
        const fineData = await calculateFine(student_id);
        fineAmount = fineData.fine;
      }

      await FeePayment.create({
        student_id,
        billing_month,
        billing_year,
        amount_paid: parseFloat(amount),
        fine_amount: fineAmount,
        pending_after: 0, // recalculateChain will fix this
        payment_date,
        payment_method,
        receipt_number: receiptNum,
        is_system_generated: false,
        is_reversal: false,
        remarks,
        received_by: req.user?.id || null
      }, { transaction: txn });

      await recalculateChain(student_id, billing_month, billing_year, txn);

      const student = await Student.findByPk(student_id, {
        include: [{ model: User, as: 'user' }, { model: Class, as: 'class' }],
        transaction: txn
      });
      const studentName = student?.user?.name || 'Unknown';
      const className = student?.class ? `${student.class.class_name}-${student.class.section}` : '';

      await PaymentLog.create({
        type: 'fees',
        direction: 'income',
        amount: parseFloat(amount),
        date: payment_date,
        description: `Fee payment by ${studentName} (Class ${className}) — Receipt: ${receiptNum}`,
        reference_type: 'fee_payments',
        recorded_by: req.user?.id || null
      }, { transaction: txn });

      if (fineAmount > 0) {
        await PaymentLog.create({
          type: 'fine',
          direction: 'income',
          amount: fineAmount,
          date: payment_date,
          description: `Late fee fine from ${studentName} (Class ${className})`,
          reference_type: 'fee_payments',
          recorded_by: req.user?.id || null
        }, { transaction: txn });
      }

      await txn.commit();
      return res.json({ success: true, message: 'Backdated payment recorded and chain recalculated', receipt_number: receiptNum });
    }

    // Normal (non-backdated) payment flow — generate gap rows if needed
    if (lastMonth !== null) {
      const { gapRows, runningPending } = await generateGapRows(
        student_id, lastMonth, lastYear, lastPending, billing_month, billing_year
      );
      if (gapRows.length > 0) {
        await FeePayment.bulkCreate(gapRows, { transaction: txn });
        lastPending = runningPending;
      }
    }

    // Add this month's fee if this is a new billing month for the student
    const session = await getSessionForMonth(billing_month, billing_year);
    let currentMonthFee = 0;
    let currentMonthDiscount = 0;

    if (session && !isExcludedMonth(billing_month, session)) {
      const existingThisMonth = await FeePayment.findOne({
        where: { student_id, billing_month, billing_year },
        transaction: txn
      });
      if (!existingThisMonth) {
        const feeConfig = await getStudentFeeForSession(student_id, session.id);
        currentMonthFee = feeConfig ? parseFloat(feeConfig.monthly_fee) : 0;
        currentMonthDiscount = feeConfig ? parseFloat(feeConfig.discount) : 0;
      }
    }

    let fineAmount = 0;
    if (include_fine) {
      const fineData = await calculateFine(student_id);
      fineAmount = fineData.fine;
    }

    const newPending = lastPending + currentMonthFee - currentMonthDiscount + fineAmount - parseFloat(amount);
    const sessionName = session ? session.name : 'UNKNOWN';
    const receiptNum = await generateReceiptNumber(sessionName, false);

    const paymentRow = await FeePayment.create({
      student_id,
      billing_month,
      billing_year,
      amount_paid: parseFloat(amount),
      fine_amount: fineAmount,
      pending_after: newPending,
      payment_date,
      payment_method,
      receipt_number: receiptNum,
      is_system_generated: false,
      is_reversal: false,
      remarks,
      received_by: req.user?.id || null
    }, { transaction: txn });

    const student = await Student.findByPk(student_id, {
      include: [{ model: User, as: 'user' }, { model: Class, as: 'class' }],
      transaction: txn
    });
    const studentName = student?.user?.name || 'Unknown';
    const className = student?.class ? `${student.class.class_name}-${student.class.section}` : '';

    await PaymentLog.create({
      type: 'fees',
      direction: 'income',
      amount: parseFloat(amount),
      date: payment_date,
      description: `Fee payment by ${studentName} (Class ${className}) — Receipt: ${receiptNum}`,
      reference_id: paymentRow.id,
      reference_type: 'fee_payments',
      recorded_by: req.user?.id || null
    }, { transaction: txn });

    if (fineAmount > 0) {
      await PaymentLog.create({
        type: 'fine',
        direction: 'income',
        amount: fineAmount,
        date: payment_date,
        description: `Late fee fine from ${studentName} (Class ${className})`,
        reference_id: paymentRow.id,
        reference_type: 'fee_payments',
        recorded_by: req.user?.id || null
      }, { transaction: txn });
    }

    await txn.commit();
    res.json({
      success: true,
      message: 'Payment recorded successfully',
      receipt_number: receiptNum,
      pending_after: newPending,
      payment: paymentRow
    });
  } catch (error) {
    await txn.rollback();
    console.error('Error recording payment:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment' });
  }
};

// ──────────────────────────────────────────────────
// RECORD BULK PAYMENTS FOR A CLASS
// POST /api/admin/fees/bulk-pay
// Body: { payment_date, payment_method, billing_month, billing_year, payments: [{ student_id, amount, remarks? }] }
// ──────────────────────────────────────────────────
const recordBulkPayment = async (req, res) => {
  const { payment_date, billing_month, billing_year, payments } = req.body;

  if (!payment_date || !billing_month || !billing_year || !payments?.length) {
    return res.status(400).json({
      success: false,
      message: 'payment_date, billing_month, billing_year, and payments array are required'
    });
  }

  const results = [];
  const errors = [];

  for (const p of payments) {
    if (!p.student_id || p.amount == null || parseFloat(p.amount) <= 0) continue;

    const txn = await sequelize.transaction();
    try {
      const lastRow = await FeePayment.findOne({
        where: { student_id: p.student_id },
        order: [['billing_year', 'DESC'], ['billing_month', 'DESC'], ['id', 'DESC']],
        lock: txn.LOCK.UPDATE,
        transaction: txn
      });

      let lastPending = 0;
      let lastMonth = null;
      let lastYear = null;

      if (lastRow) {
        lastPending = parseFloat(lastRow.pending_after);
        lastMonth = lastRow.billing_month;
        lastYear = lastRow.billing_year;
      } else {
        const student = await Student.findByPk(p.student_id, { transaction: txn });
        if (student && student.admission_date) {
          const admDate = new Date(student.admission_date);
          lastMonth = admDate.getMonth() + 1;
          lastYear = admDate.getFullYear();
          if (lastMonth === 1) { lastMonth = 12; lastYear -= 1; }
          else { lastMonth -= 1; }
        }
      }

      if (lastMonth !== null) {
        const { gapRows, runningPending } = await generateGapRows(
          p.student_id, lastMonth, lastYear, lastPending, billing_month, billing_year
        );
        if (gapRows.length > 0) {
          await FeePayment.bulkCreate(gapRows, { transaction: txn });
          lastPending = runningPending;
        }
      }

      const session = await getSessionForMonth(billing_month, billing_year);
      let currentMonthFee = 0;
      let currentMonthDiscount = 0;

      if (session && !isExcludedMonth(billing_month, session)) {
        const existingThisMonth = await FeePayment.findOne({
          where: { student_id: p.student_id, billing_month, billing_year },
          transaction: txn
        });
        if (!existingThisMonth) {
          const feeConfig = await getStudentFeeForSession(p.student_id, session.id);
          currentMonthFee = feeConfig ? parseFloat(feeConfig.monthly_fee) : 0;
          currentMonthDiscount = feeConfig ? parseFloat(feeConfig.discount) : 0;
        }
      }

      const newPending = lastPending + currentMonthFee - currentMonthDiscount - parseFloat(p.amount);
      const sessionName = session ? session.name : 'UNKNOWN';
      const receiptNum = await generateReceiptNumber(sessionName, false);

      const paymentRow = await FeePayment.create({
        student_id: p.student_id,
        billing_month,
        billing_year,
        amount_paid: parseFloat(p.amount),
        fine_amount: 0,
        pending_after: newPending,
        payment_date,
        payment_method: p.payment_method,
        receipt_number: receiptNum,
        is_system_generated: false,
        is_reversal: false,
        remarks: p.remarks || null,
        received_by: req.user?.id || null
      }, { transaction: txn });

      const student = await Student.findByPk(p.student_id, {
        include: [{ model: User, as: 'user' }, { model: Class, as: 'class' }],
        transaction: txn
      });
      const studentName = student?.user?.name || 'Unknown';
      const className = student?.class ? `${student.class.class_name}-${student.class.section}` : '';

      await PaymentLog.create({
        type: 'fees',
        direction: 'income',
        amount: parseFloat(p.amount),
        date: payment_date,
        description: `Fee payment by ${studentName} (Class ${className}) — Receipt: ${receiptNum}`,
        reference_id: paymentRow.id,
        reference_type: 'fee_payments',
        recorded_by: req.user?.id || null
      }, { transaction: txn });

      await txn.commit();
      results.push({ student_id: p.student_id, receipt_number: receiptNum, pending_after: newPending, success: true });
    } catch (err) {
      await txn.rollback();
      console.error(`Error recording bulk payment for student ${p.student_id}:`, err);
      errors.push({ student_id: p.student_id, error: err.message });
    }
  }

  res.json({
    success: true,
    message: `${results.length} payments recorded, ${errors.length} failed`,
    results,
    errors
  });
};

// ──────────────────────────────────────────────────
// GET STUDENT FEE HISTORY (ADMIN VIEW)
// GET /api/admin/fees/student/:id
// ──────────────────────────────────────────────────
const getStudentFeeHistory = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findByPk(studentId, {
      include: [
        { model: User, as: 'user', attributes: ['name', 'email', 'phone'] },
        { model: Class, as: 'class', attributes: ['class_name', 'section'] }
      ]
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // All fee payment rows in chronological order
    const payments = await FeePayment.findAll({
      where: { student_id: studentId },
      order: [['billing_year', 'ASC'], ['billing_month', 'ASC'], ['id', 'ASC']]
    });

    const lastRow = payments.length > 0 ? payments[payments.length - 1] : null;
    const currentPending = lastRow ? parseFloat(lastRow.pending_after) : 0;

    // Dynamic fine
    const fineData = await calculateFine(parseInt(studentId));

    // Fee configs per session
    const feeConfigs = await StudentFee.findAll({
      where: { student_id: studentId },
      include: [{ model: Session, as: 'session' }]
    });

    // Month-wise breakdown with per-month net pending
    const monthlyBreakdown = payments.map((row, idx) => {
      const prevPending = idx > 0 ? parseFloat(payments[idx - 1].pending_after) : 0;
      return {
        id: row.id,
        billing_month: row.billing_month,
        billing_year: row.billing_year,
        amount_paid: parseFloat(row.amount_paid),
        fine_amount: parseFloat(row.fine_amount),
        pending_after: parseFloat(row.pending_after),
        month_net_pending: parseFloat(row.pending_after) - prevPending,
        payment_date: row.payment_date,
        payment_method: row.payment_method,
        receipt_number: row.receipt_number,
        is_system_generated: row.is_system_generated,
        is_reversal: row.is_reversal,
        reversal_for: row.reversal_for,
        remarks: row.remarks
      };
    });

    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);

    res.json({
      success: true,
      student: {
        id: student.id,
        name: student.user?.name,
        email: student.user?.email,
        phone: student.user?.phone,
        class: student.class ? `${student.class.class_name}-${student.class.section}` : null,
        roll_number: student.roll_number,
        admission_date: student.admission_date,
        status: student.status
      },
      currentPending,
      fine: fineData,
      feeConfigs: feeConfigs.map(fc => ({
        session_id: fc.session_id,
        session_name: fc.session?.name,
        monthly_fee: parseFloat(fc.monthly_fee),
        discount: parseFloat(fc.discount),
        discount_reason: fc.discount_reason,
        effective_fee: parseFloat(fc.monthly_fee) - parseFloat(fc.discount)
      })),
      payments: monthlyBreakdown,
      totalPaid
    });
  } catch (error) {
    console.error('Error fetching student fee history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee history' });
  }
};

// ──────────────────────────────────────────────────
// GET STUDENTS WITH DUES
// GET /api/admin/fees/dues?class_id=&sort=asc|desc
// ──────────────────────────────────────────────────
const getStudentsWithDues = async (req, res) => {
  try {
    const { class_id, sort = 'desc' } = req.query;

    const studentWhere = { status: { [Op.in]: ['active', 'promoted'] } };
    if (class_id) studentWhere.class_id = parseInt(class_id);

    const students = await Student.findAll({
      where: studentWhere,
      include: [
        { model: User, as: 'user', attributes: ['name', 'phone'] },
        { model: Class, as: 'class', attributes: ['class_name', 'section'] }
      ]
    });

    const studentsWithDues = [];

    for (const student of students) {
      const lastRow = await FeePayment.findOne({
        where: { student_id: student.id },
        order: [['billing_year', 'DESC'], ['billing_month', 'DESC'], ['id', 'DESC']]
      });

      const pending = lastRow ? parseFloat(lastRow.pending_after) : 0;
      if (pending > 0) {
        const fineData = await calculateFine(student.id);
        const fine = fineData.fine || 0;
        studentsWithDues.push({
          id: student.id,
          name: student.user?.name,
          phone: student.user?.phone,
          class: student.class ? `${student.class.class_name}-${student.class.section}` : null,
          class_id: student.class_id,
          roll_number: student.roll_number,
          pending,
          fine,
          total_due: pending + fine,
          last_billing_month: lastRow?.billing_month,
          last_billing_year: lastRow?.billing_year
        });
      }
    }

    studentsWithDues.sort((a, b) => sort === 'asc' ? a.pending - b.pending : b.pending - a.pending);

    res.json({
      success: true,
      count: studentsWithDues.length,
      total_dues: studentsWithDues.reduce((sum, s) => sum + s.total_due, 0),
      students: studentsWithDues
    });
  } catch (error) {
    console.error('Error fetching students with dues:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dues' });
  }
};

// ──────────────────────────────────────────────────
// CLASS-WISE FEE REPORT
// GET /api/admin/fees/classwise?session_id=
// ──────────────────────────────────────────────────
const getClasswiseReport = async (req, res) => {
  try {
    const { session_id } = req.query;
    let sessionFilter = null;
    if (session_id) {
      sessionFilter = await Session.findByPk(session_id);
    }

    const classes = await Class.findAll({
      order: [['class_name', 'ASC'], ['section', 'ASC']],
      include: [{
        model: Student,
        as: 'students',
        where: { status: { [Op.in]: ['active', 'promoted'] } },
        required: false,
        attributes: ['id']
      }]
    });

    const report = [];

    for (const cls of classes) {
      let totalCollected = 0;
      let totalPending = 0;
      const studentCount = cls.students?.length || 0;

      for (const student of (cls.students || [])) {
        // Build payment where clause
        const paymentWhere = {
          student_id: student.id,
          is_system_generated: false,
          amount_paid: { [Op.gt]: 0 }
        };

        if (sessionFilter) {
          const startVal = sessionFilter.start_year * 100 + sessionFilter.start_month;
          const endVal = sessionFilter.end_year * 100 + sessionFilter.end_month;
          paymentWhere[Op.and] = [
            sequelize.literal(`(billing_year * 100 + billing_month) >= ${startVal}`),
            sequelize.literal(`(billing_year * 100 + billing_month) <= ${endVal}`)
          ];
        }

        const paid = await FeePayment.sum('amount_paid', { where: paymentWhere });
        totalCollected += parseFloat(paid || 0);

        const lastRow = await FeePayment.findOne({
          where: { student_id: student.id },
          order: [['billing_year', 'DESC'], ['billing_month', 'DESC'], ['id', 'DESC']]
        });
        const pending = lastRow ? parseFloat(lastRow.pending_after) : 0;
        if (pending > 0) totalPending += pending;
      }

      report.push({
        class_id: cls.id,
        class_name: cls.class_name,
        section: cls.section,
        student_count: studentCount,
        total_collected: totalCollected,
        total_pending: totalPending
      });
    }

    res.json({ success: true, report });
  } catch (error) {
    console.error('Error fetching classwise report:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch classwise report' });
  }
};

// ──────────────────────────────────────────────────
// RECORD REVERSAL
// POST /api/admin/fees/reverse/:id
// Body: { remarks? }
// ──────────────────────────────────────────────────
const recordReversal = async (req, res) => {
  const txn = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const originalPayment = await FeePayment.findByPk(id, { transaction: txn, lock: txn.LOCK.UPDATE });
    if (!originalPayment) {
      await txn.rollback();
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (originalPayment.is_system_generated) {
      await txn.rollback();
      return res.status(400).json({ success: false, message: 'Cannot reverse a system-generated row' });
    }

    if (originalPayment.is_reversal) {
      await txn.rollback();
      return res.status(400).json({ success: false, message: 'Cannot reverse a reversal entry' });
    }

    const existingReversal = await FeePayment.findOne({
      where: { reversal_for: id },
      transaction: txn
    });
    if (existingReversal) {
      await txn.rollback();
      return res.status(400).json({ success: false, message: 'This payment has already been reversed' });
    }

    const session = await getSessionForMonth(originalPayment.billing_month, originalPayment.billing_year);
    const sessionName = session ? session.name : 'UNKNOWN';
    const receiptNum = await generateReceiptNumber(sessionName, true);
    const today = new Date().toISOString().split('T')[0];

    await FeePayment.create({
      student_id: originalPayment.student_id,
      billing_month: originalPayment.billing_month,
      billing_year: originalPayment.billing_year,
      amount_paid: -parseFloat(originalPayment.amount_paid),
      fine_amount: -parseFloat(originalPayment.fine_amount),
      pending_after: 0, // recalculateChain will fix this
      payment_date: today,
      payment_method: originalPayment.payment_method,
      receipt_number: receiptNum,
      is_system_generated: false,
      is_reversal: true,
      reversal_for: originalPayment.id,
      remarks: remarks || `Reversal of ${originalPayment.receipt_number}`,
      received_by: req.user?.id || null
    }, { transaction: txn });

    await recalculateChain(originalPayment.student_id, originalPayment.billing_month, originalPayment.billing_year, txn);

    const student = await Student.findByPk(originalPayment.student_id, {
      include: [{ model: User, as: 'user' }, { model: Class, as: 'class' }],
      transaction: txn
    });
    const studentName = student?.user?.name || 'Unknown';
    const className = student?.class ? `${student.class.class_name}-${student.class.section}` : '';

    await PaymentLog.create({
      type: 'fees',
      direction: 'income',
      amount: -parseFloat(originalPayment.amount_paid),
      date: today,
      description: `Reversal of ${originalPayment.receipt_number} for ${studentName} (Class ${className}) — Receipt: ${receiptNum}`,
      reference_type: 'fee_payments',
      recorded_by: req.user?.id || null
    }, { transaction: txn });

    await txn.commit();
    res.json({ success: true, message: 'Payment reversed successfully', receipt_number: receiptNum });
  } catch (error) {
    await txn.rollback();
    console.error('Error reversing payment:', error);
    res.status(500).json({ success: false, message: 'Failed to reverse payment' });
  }
};

// ──────────────────────────────────────────────────
// PROFIT REPORT
// GET /api/admin/fees/profit?start_date=&end_date=&month=&year=&session_id=
// ──────────────────────────────────────────────────
const getProfitReport = async (req, res) => {
  try {
    const { start_date, end_date, month, year, session_id } = req.query;

    let dateWhere = {};

    if (start_date && end_date) {
      dateWhere.date = { [Op.between]: [start_date, end_date] };
    } else if (month && year) {
      const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];
      dateWhere.date = { [Op.between]: [firstDay, lastDay] };
    } else if (session_id) {
      const session = await Session.findByPk(session_id);
      if (session) {
        const startStr = `${session.start_year}-${String(session.start_month).padStart(2, '0')}-01`;
        const endDay = new Date(session.end_year, session.end_month, 0).getDate();
        const endStr = `${session.end_year}-${String(session.end_month).padStart(2, '0')}-${endDay}`;
        dateWhere.date = { [Op.between]: [startStr, endStr] };
      }
    }

    const entries = await PaymentLog.findAll({
      where: dateWhere,
      order: [['date', 'DESC'], ['id', 'DESC']]
    });

    const totalIncome = entries
      .filter(e => e.direction === 'income')
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const totalExpenditure = entries
      .filter(e => e.direction === 'expenditure')
      .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const profit = totalIncome - totalExpenditure;

    // Breakdown by type
    const breakdownMap = {};
    for (const e of entries) {
      if (!breakdownMap[e.type]) {
        breakdownMap[e.type] = { type: e.type, direction: e.direction, total: 0, count: 0 };
      }
      breakdownMap[e.type].total += parseFloat(e.amount);
      breakdownMap[e.type].count += 1;
    }

    res.json({
      success: true,
      summary: {
        total_income: totalIncome,
        total_expenditure: totalExpenditure,
        profit,
        entry_count: entries.length
      },
      breakdown: Object.values(breakdownMap),
      entries: entries.map(e => ({
        id: e.id,
        type: e.type,
        direction: e.direction,
        amount: parseFloat(e.amount),
        date: e.date,
        description: e.description
      }))
    });
  } catch (error) {
    console.error('Error fetching profit report:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profit report' });
  }
};

// ──────────────────────────────────────────────────
// ADD MANUAL PAYMENT LOG ENTRY (expense or misc income)
// POST /api/admin/payment-log
// Body: { type, direction, amount, date, description }
// ──────────────────────────────────────────────────
const addPaymentLogEntry = async (req, res) => {
  try {
    const { type, direction, amount, date, description } = req.body;

    if (!type || !direction || amount == null || !date) {
      return res.status(400).json({
        success: false,
        message: 'type, direction, amount, and date are required'
      });
    }

    if (!['income', 'expenditure'].includes(direction)) {
      return res.status(400).json({ success: false, message: 'direction must be "income" or "expenditure"' });
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be positive' });
    }

    const entry = await PaymentLog.create({
      type,
      direction,
      amount: parseFloat(amount),
      date,
      description: description || null,
      recorded_by: req.user?.id || null
    });

    res.status(201).json({ success: true, message: 'Entry recorded', entry });
  } catch (error) {
    console.error('Error adding payment log entry:', error);
    res.status(500).json({ success: false, message: 'Failed to add entry' });
  }
};

// ──────────────────────────────────────────────────
// PAYMENT LOG
// GET /api/admin/payment-log?type=&direction=&start_date=&end_date=&limit=&offset=
// ──────────────────────────────────────────────────
const getPaymentLog = async (req, res) => {
  try {
    const { type, direction, start_date, end_date, limit = 100, offset = 0 } = req.query;

    const where = {};
    if (type) where.type = type;
    if (direction) where.direction = direction;
    if (start_date && end_date) {
      where.date = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      where.date = { [Op.gte]: start_date };
    } else if (end_date) {
      where.date = { [Op.lte]: end_date };
    }

    const { count, rows } = await PaymentLog.findAndCountAll({
      where,
      order: [['date', 'DESC'], ['id', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      total: count,
      entries: rows.map(e => ({
        id: e.id,
        type: e.type,
        direction: e.direction,
        amount: parseFloat(e.amount),
        date: e.date,
        description: e.description,
        reference_id: e.reference_id,
        reference_type: e.reference_type
      }))
    });
  } catch (error) {
    console.error('Error fetching payment log:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment log' });
  }
};

// ──────────────────────────────────────────────────
// STUDENT: GET MY FEE HISTORY
// GET /api/student/fee-history
// ──────────────────────────────────────────────────
const getMyFeeHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    // Delegate to admin handler with the student's id
    req.params = { id: student.id };
    return getStudentFeeHistory(req, res);
  } catch (error) {
    console.error('Error fetching student fee history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch fee history' });
  }
};

module.exports = {
  recordPayment,
  recordBulkPayment,
  getStudentFeeHistory,
  getStudentsWithDues,
  getClasswiseReport,
  recordReversal,
  getProfitReport,
  getPaymentLog,
  addPaymentLogEntry,
  getMyFeeHistory
};
