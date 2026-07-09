const { FeePayment, StudentFee, Student, User, Class, Session, PaymentLog, UniformPayment, UniformTransaction, BookPayment, BookTransaction, Expense, AdmissionFee } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const {
  getSessionForMonth,
  getStudentFeeForSession,
  isExcludedMonth,
  generateGapRows,
  generateReceiptNumber,
  calculateFine,
  recalculateChain,
  ensureBilledUpTo
} = require('../utils/feeEngine');

// Current month/year in IST (school runs in India; server may be on UTC).
const currentBillingPeriod = () => {
  const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return { month: nowIST.getUTCMonth() + 1, year: nowIST.getUTCFullYear() };
};

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
  const activeSession = await Session.findOne({ where: { is_active: true } });

  for (const p of payments) {
    const payAmount = parseFloat(p.amount) || 0;
    const prevDues = Math.max(parseFloat(p.previous_dues) || 0, 0);
    const admPay = Math.max(parseFloat(p.adm_pay) || 0, 0);
    const hasAdmDiscount = p.adm_discount !== undefined && p.adm_discount !== null && p.adm_discount !== '';
    const admDiscount = Math.max(parseFloat(p.adm_discount) || 0, 0);
    const doMonthly = payAmount > 0 || prevDues > 0;
    const doAdmission = (admPay > 0 || hasAdmDiscount) && !!activeSession;
    // Process a line if there is monthly OR admission activity.
    if (!p.student_id || (!doMonthly && !doAdmission)) continue;

    const txn = await sequelize.transaction();
    try {
      let receiptNum = null, newPending = null;

      if (doMonthly) {
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

      // previous_dues is an opening-balance charge added to the running balance.
      newPending = lastPending + currentMonthFee - currentMonthDiscount + prevDues - payAmount;
      const sessionName = session ? session.name : 'UNKNOWN';
      receiptNum = await generateReceiptNumber(sessionName, false);

      const paymentRow = await FeePayment.create({
        student_id: p.student_id,
        billing_month,
        billing_year,
        amount_paid: payAmount,
        fine_amount: 0,
        adjustment: prevDues,
        pending_after: newPending,
        payment_date,
        payment_method: p.payment_method,
        receipt_number: receiptNum,
        is_system_generated: false,
        is_reversal: false,
        remarks: prevDues > 0 ? `${p.remarks ? p.remarks + ' | ' : ''}Previous dues added: ${prevDues}` : (p.remarks || null),
        received_by: req.user?.id || null
      }, { transaction: txn });

      // Only log actual money received (a dues-only entry with no payment isn't income).
      if (payAmount > 0) {
        const student = await Student.findByPk(p.student_id, {
          include: [{ model: User, as: 'user' }, { model: Class, as: 'class' }],
          transaction: txn
        });
        const studentName = student?.user?.name || 'Unknown';
        const className = student?.class ? `${student.class.class_name}-${student.class.section}` : '';

        await PaymentLog.create({
          type: 'fees',
          direction: 'income',
          amount: payAmount,
          date: payment_date,
          description: `Fee payment by ${studentName} (Class ${className}) — Receipt: ${receiptNum}`,
          reference_id: paymentRow.id,
          reference_type: 'fee_payments',
          recorded_by: req.user?.id || null
        }, { transaction: txn });
      }
      } // end if (doMonthly)

      // ── Admission fee (independent of monthly) ──
      let admissionPaid = 0;
      if (doAdmission) {
        const adm = await AdmissionFee.findOne({
          where: { student_id: p.student_id, session_id: activeSession.id },
          lock: txn.LOCK.UPDATE,
          transaction: txn
        });
        if (adm) {
          const newDiscount = hasAdmDiscount ? admDiscount : parseFloat(adm.discount);
          await adm.update({
            discount: newDiscount,
            paid_amount: parseFloat(adm.paid_amount) + admPay,
            assumed_paid: false, // a real payment/edit drops the pre-tracking assumption
          }, { transaction: txn });

          // Only real money collected counts as profit.
          if (admPay > 0) {
            const st = await Student.findByPk(p.student_id, {
              include: [{ model: User, as: 'user' }, { model: Class, as: 'class' }],
              transaction: txn
            });
            const sName = st?.user?.name || 'Unknown';
            const cName = st?.class ? `${st.class.class_name}-${st.class.section}` : '';
            await PaymentLog.create({
              type: 'admission',
              direction: 'income',
              amount: admPay,
              date: payment_date,
              description: `Admission fee by ${sName} (Class ${cName})`,
              reference_id: adm.id,
              reference_type: 'admission_fees',
              recorded_by: req.user?.id || null
            }, { transaction: txn });
            admissionPaid = admPay;
          }
        }
      }

      await txn.commit();
      results.push({ student_id: p.student_id, receipt_number: receiptNum, pending_after: newPending, admission_paid: admissionPaid, success: true });
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

    // Materialize any unbilled months (incl. current) before reading the ledger,
    // so a student's pending shows up without a payment having been recorded.
    try {
      const { month: curMonth, year: curYear } = currentBillingPeriod();
      await ensureBilledUpTo(parseInt(studentId), curMonth, curYear);
    } catch (genErr) {
      console.error(`Fee auto-bill failed for student ${studentId}:`, genErr.message);
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
        adjustment: parseFloat(row.adjustment || 0),
        remarks: row.remarks
      };
    });

    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
    const totalAdjustment = payments.reduce((sum, p) => sum + parseFloat(p.adjustment || 0), 0);

    // Admission fee for the active session (drives the bulk-screen Adm Fee column).
    const activeSession = await Session.findOne({ where: { is_active: true } });
    let admissionFee = null;
    if (activeSession) {
      const adm = await AdmissionFee.findOne({
        where: { student_id: studentId, session_id: activeSession.id }
      });
      if (adm) {
        const charge = parseFloat(adm.annual_charge);
        const disc = parseFloat(adm.discount);
        const paid = parseFloat(adm.paid_amount);
        admissionFee = {
          annual_charge: charge,
          discount: disc,
          paid_amount: paid,
          assumed_paid: adm.assumed_paid,
          due: adm.assumed_paid ? 0 : Math.max(0, charge - disc - paid),
        };
      }
    }

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
      totalPaid,
      totalAdjustment,
      admissionFee
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
    const { month: curMonth, year: curYear } = currentBillingPeriod();

    for (const student of students) {
      // Materialize any unbilled months (incl. current) so pending shows up
      // even when no payment has been recorded yet. Idempotent per student.
      try {
        await ensureBilledUpTo(student.id, curMonth, curYear);
      } catch (genErr) {
        console.error(`Fee auto-bill failed for student ${student.id}:`, genErr.message);
      }

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
          category: student.category || null,
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
    const { month: curMonth, year: curYear } = currentBillingPeriod();

    for (const cls of classes) {
      let totalCollected = 0;
      let totalPending = 0;
      const studentCount = cls.students?.length || 0;

      for (const student of (cls.students || [])) {
        // Materialize unbilled months (incl. current) so pending is accurate.
        try {
          await ensureBilledUpTo(student.id, curMonth, curYear);
        } catch (genErr) {
          console.error(`Fee auto-bill failed for student ${student.id}:`, genErr.message);
        }

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
// PROFIT REPORT — consolidated across all sources
// GET /api/admin/profit?from=YYYY-MM-DD&to=YYYY-MM-DD
// ──────────────────────────────────────────────────
const getProfitReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    const dateCond = (col) => {
      if (from && to) return { [col]: { [Op.between]: [from, to] } };
      if (from)       return { [col]: { [Op.gte]: from } };
      if (to)         return { [col]: { [Op.lte]: to } };
      return {};
    };

    const [paymentLogs, uniformPayments, bookPayments, expenses] = await Promise.all([
      PaymentLog.findAll({ where: dateCond('date'), order: [['date', 'DESC']] }),
      UniformPayment.findAll({
        where: dateCond('payment_date'),
        include: [{ model: UniformTransaction, as: 'transaction', attributes: ['admission_number', 'student_name'] }],
      }),
      BookPayment.findAll({
        where: dateCond('payment_date'),
        include: [{ model: BookTransaction, as: 'transaction', attributes: ['admission_number', 'student_name'] }],
      }),
      // All expenditure reasons (stationary, pantry, inventory, salary, …).
      Expense.findAll({ where: dateCond('date') }),
    ]);

    const transactions = [];

    for (const log of paymentLogs) {
      transactions.push({
        id: `log_${log.id}`,
        type: log.type,
        direction: log.direction,
        amount: parseFloat(log.amount),
        date: log.date,
        description: log.description || '',
      });
    }

    for (const up of uniformPayments) {
      const txn = up.transaction;
      transactions.push({
        id: `uniform_${up.id}`,
        type: 'uniform',
        direction: 'income',
        amount: parseFloat(up.amount_paid),
        date: up.payment_date,
        description: `Uniform purchase${txn?.student_name ? ` — ${txn.student_name}` : ''}${up.remarks ? ` (${up.remarks})` : ''}`,
      });
    }

    for (const bp of bookPayments) {
      const txn = bp.transaction;
      transactions.push({
        id: `book_${bp.id}`,
        type: 'books',
        direction: 'income',
        amount: parseFloat(bp.amount_paid),
        date: bp.payment_date,
        description: `Book purchase${txn?.student_name ? ` — ${txn.student_name}` : ''}${bp.remarks ? ` (${bp.remarks})` : ''}`,
      });
    }

    // "stationary" is the stored key but displays as "stationery"; others use their own key.
    const expTypeLabel = (c) => (c === 'stationary' ? 'stationery' : c || 'other');
    for (const exp of expenses) {
      transactions.push({
        id: `exp_${exp.id}`,
        type: expTypeLabel(exp.category),
        direction: 'expenditure',
        amount: parseFloat(exp.amount),
        date: exp.date,
        description: exp.description || `${expTypeLabel(exp.category)} expense`,
      });
    }

    transactions.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

    const income      = transactions.filter(t => t.direction === 'income');
    const expenditure = transactions.filter(t => t.direction === 'expenditure');

    const totalIncome      = income.reduce((s, t) => s + t.amount, 0);
    const totalExpenditure = expenditure.reduce((s, t) => s + t.amount, 0);
    const profit           = totalIncome - totalExpenditure;

    const groupByType = (arr) => {
      const map = {};
      for (const t of arr) {
        if (!map[t.type]) map[t.type] = { type: t.type, total: 0, count: 0 };
        map[t.type].total += t.amount;
        map[t.type].count += 1;
      }
      return Object.values(map).sort((a, b) => b.total - a.total);
    };

    res.json({
      success: true,
      totalIncome,
      totalExpenditure,
      profit,
      incomeByType: groupByType(income),
      expenditureByType: groupByType(expenditure),
      transactions,
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
