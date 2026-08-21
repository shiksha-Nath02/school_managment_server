const { Session, StudentFee, Student, User, Class, FeePayment, AdmissionFee, PaymentLog } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { recalculateChain } = require('../utils/feeEngine');

// GET /api/admin/sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.findAll({
      order: [['start_year', 'DESC'], ['start_month', 'DESC']]
    });
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
};

// GET /api/admin/sessions/active
const getActiveSession = async (req, res) => {
  try {
    const session = await Session.findOne({ where: { is_active: true } });
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error fetching active session:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active session' });
  }
};

// GET /api/admin/sessions/:id
const getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findByPk(id, {
      include: [{
        model: StudentFee,
        as: 'studentFees',
        include: [{
          model: Student,
          as: 'student',
          include: [
            { model: User, as: 'user', attributes: ['name'] },
            { model: Class, as: 'class', attributes: ['class_name', 'section'] }
          ]
        }]
      }]
    });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch session' });
  }
};

// POST /api/admin/sessions
const createSession = async (req, res) => {
  const txn = await sequelize.transaction();
  try {
    const {
      name, start_month, start_year,
      excluded_months, fine_enabled, fine_per_day, grace_period_days, admission_fee,
      default_monthly_fee, copy_from_session_id, fee_increase_percent,
      student_fees, // optional: array of { student_id, monthly_fee, discount, discount_reason }
      is_active     // optional: pass false to create a DRAFT (does not deactivate the live session)
    } = req.body;

    // Default true (legacy behaviour). Explicit false => draft session left inactive
    // so a half-finished setup can never knock the current live session offline.
    const makeActive = is_active !== false;

    if (!name || !start_month || !start_year) {
      await txn.rollback();
      return res.status(400).json({ success: false, message: 'name, start_month, and start_year are required' });
    }

    // Calculate end month/year (one month before next session's start, i.e. 12 months later)
    let end_month = start_month - 1;
    let end_year = start_year + 1;
    if (end_month === 0) {
      end_month = 12;
      end_year = start_year;
    }

    // Check for overlapping sessions
    const existingSessions = await Session.findAll({ transaction: txn });
    const newStart = start_year * 12 + start_month;
    const newEnd = end_year * 12 + end_month;

    for (const s of existingSessions) {
      const existStart = s.start_year * 12 + s.start_month;
      const existEnd = s.end_year * 12 + s.end_month;
      if (newStart <= existEnd && newEnd >= existStart) {
        await txn.rollback();
        return res.status(400).json({
          success: false,
          message: `Session overlaps with existing session "${s.name}" (${s.start_month}/${s.start_year} - ${s.end_month}/${s.end_year})`
        });
      }
    }

    // Deactivate all other sessions only when this one is going live now.
    if (makeActive) {
      await Session.update({ is_active: false }, { where: {}, transaction: txn });
    }

    // Create the session
    const session = await Session.create({
      name,
      start_month,
      start_year,
      end_month,
      end_year,
      excluded_months: excluded_months || [],
      fine_enabled: fine_enabled || false,
      fine_per_day: fine_per_day || 0,
      grace_period_days: grace_period_days || 10,
      admission_fee: admission_fee || 0,
      is_active: makeActive,
      created_by: req.user?.id || null
    }, { transaction: txn });

    // Set up student fees
    if (student_fees && student_fees.length > 0) {
      // Individual fees provided
      const feeRecords = student_fees.map(sf => ({
        student_id: sf.student_id,
        session_id: session.id,
        monthly_fee: sf.monthly_fee,
        discount: sf.discount || 0,
        discount_reason: sf.discount_reason || null
      }));
      await StudentFee.bulkCreate(feeRecords, { transaction: txn });
    } else if (copy_from_session_id) {
      // Copy from previous session with optional increase
      const prevFees = await StudentFee.findAll({
        where: { session_id: copy_from_session_id },
        transaction: txn
      });
      const multiplier = 1 + (fee_increase_percent || 0) / 100;
      const newFees = prevFees.map(pf => ({
        student_id: pf.student_id,
        session_id: session.id,
        monthly_fee: Math.round(parseFloat(pf.monthly_fee) * multiplier),
        discount: parseFloat(pf.discount),
        discount_reason: pf.discount_reason
      }));
      if (newFees.length > 0) {
        await StudentFee.bulkCreate(newFees, { transaction: txn });
      }
    } else if (default_monthly_fee) {
      // Set same fee for all active students
      const activeStudents = await Student.findAll({
        where: { status: 'active' },
        attributes: ['id'],
        transaction: txn
      });
      const feeRecords = activeStudents.map(s => ({
        student_id: s.id,
        session_id: session.id,
        monthly_fee: default_monthly_fee,
        discount: 0
      }));
      if (feeRecords.length > 0) {
        await StudentFee.bulkCreate(feeRecords, { transaction: txn });
      }
    }

    await txn.commit();
    res.json({ success: true, message: 'Session created successfully', session });
  } catch (error) {
    await txn.rollback();
    console.error('Error creating session:', error);
    res.status(500).json({ success: false, message: 'Failed to create session' });
  }
};

// PUT /api/admin/sessions/:id/fees
// Update individual student fees for a session (with recalculation if payments exist)
const updateSessionFees = async (req, res) => {
  const txn = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { student_fees } = req.body;

    if (!student_fees || !student_fees.length) {
      await txn.rollback();
      return res.status(400).json({ success: false, message: 'student_fees array is required' });
    }

    const session = await Session.findByPk(id, { transaction: txn });
    if (!session) {
      await txn.rollback();
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    for (const sf of student_fees) {
      const [feeConfig, created] = await StudentFee.findOrCreate({
        where: { student_id: sf.student_id, session_id: session.id },
        defaults: {
          monthly_fee: sf.monthly_fee,
          discount: sf.discount || 0,
          discount_reason: sf.discount_reason || null
        },
        transaction: txn
      });

      if (!created) {
        await feeConfig.update({
          monthly_fee: sf.monthly_fee,
          discount: sf.discount || 0,
          discount_reason: sf.discount_reason || null
        }, { transaction: txn });
      }

      // Recalculate the entire chain for this student from session start
      await recalculateChain(sf.student_id, session.start_month, session.start_year, txn);
    }

    await txn.commit();
    res.json({ success: true, message: 'Fees updated and recalculated successfully' });
  } catch (error) {
    await txn.rollback();
    console.error('Error updating session fees:', error);
    res.status(500).json({ success: false, message: 'Failed to update fees' });
  }
};

// PUT /api/admin/sessions/:id
// Update a session's basic settings (name, start month/year, vacation months, fine,
// admission fee). End month/year is recomputed; overlap with other sessions is rejected.
const updateSession = async (req, res) => {
  const txn = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      name, start_month, start_year, excluded_months,
      fine_enabled, fine_per_day, grace_period_days, admission_fee
    } = req.body;

    const session = await Session.findByPk(id, { transaction: txn });
    if (!session) {
      await txn.rollback();
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const sm = start_month != null ? parseInt(start_month) : session.start_month;
    const sy = start_year != null ? parseInt(start_year) : session.start_year;
    let em = sm - 1, ey = sy + 1;
    if (em === 0) { em = 12; ey = sy; }

    // Overlap check against every OTHER session
    const others = await Session.findAll({ where: { id: { [Op.ne]: session.id } }, transaction: txn });
    const newStart = sy * 12 + sm;
    const newEnd = ey * 12 + em;
    for (const s of others) {
      const existStart = s.start_year * 12 + s.start_month;
      const existEnd = s.end_year * 12 + s.end_month;
      if (newStart <= existEnd && newEnd >= existStart) {
        await txn.rollback();
        return res.status(400).json({
          success: false,
          message: `Session overlaps with existing session "${s.name}" (${s.start_month}/${s.start_year} - ${s.end_month}/${s.end_year})`
        });
      }
    }

    await session.update({
      name: name ?? session.name,
      start_month: sm,
      start_year: sy,
      end_month: em,
      end_year: ey,
      excluded_months: excluded_months ?? session.excluded_months,
      fine_enabled: fine_enabled ?? session.fine_enabled,
      fine_per_day: fine_enabled === false ? 0 : (fine_per_day ?? session.fine_per_day),
      grace_period_days: grace_period_days ?? session.grace_period_days,
      admission_fee: admission_fee ?? session.admission_fee
    }, { transaction: txn });

    await txn.commit();
    res.json({ success: true, message: 'Session updated successfully', session });
  } catch (error) {
    await txn.rollback();
    console.error('Error updating session:', error);
    res.status(500).json({ success: false, message: 'Failed to update session' });
  }
};

// DELETE /api/admin/sessions/:id
// Remove a session and EVERYTHING tied to it, in one transaction:
//  - student_fees + admission_fees cascade via the session_id FK
//  - fee_payments in the session's billing-month window (sessions can't overlap, so
//    those rows belong to this session) are removed explicitly (no session_id FK)
//  - payment_log rows referencing those fee_payments / admission_fees are removed
const deleteSession = async (req, res) => {
  const txn = await sequelize.transaction();
  try {
    const { id } = req.params;
    const session = await Session.findByPk(id, { transaction: txn });
    if (!session) {
      await txn.rollback();
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const lo = session.start_year * 12 + session.start_month;
    const hi = session.end_year * 12 + session.end_month;

    // fee_payments in this session's billing window (lo/hi are integers from the row itself)
    const fps = await FeePayment.findAll({
      where: sequelize.literal(`billing_year * 12 + billing_month BETWEEN ${lo} AND ${hi}`),
      attributes: ['id'],
      transaction: txn
    });
    const fpIds = fps.map(f => f.id);

    const adms = await AdmissionFee.findAll({
      where: { session_id: session.id },
      attributes: ['id'],
      paranoid: false,
      transaction: txn
    });
    const admIds = adms.map(a => a.id);

    // payment_log entries referencing those fee_payments / admission_fees
    let logsDeleted = 0;
    const logOr = [];
    if (fpIds.length) logOr.push({ reference_type: 'fee_payments', reference_id: { [Op.in]: fpIds } });
    if (admIds.length) logOr.push({ reference_type: 'admission_fees', reference_id: { [Op.in]: admIds } });
    if (logOr.length) {
      logsDeleted = await PaymentLog.destroy({ where: { [Op.or]: logOr }, transaction: txn });
    }

    const fpDeleted = fpIds.length
      ? await FeePayment.destroy({ where: { id: { [Op.in]: fpIds } }, transaction: txn })
      : 0;

    // Delete the session — student_fees + admission_fees cascade via FK (force = hard delete)
    await session.destroy({ transaction: txn, force: true });

    await txn.commit();
    res.json({
      success: true,
      message: 'Session and its fees deleted',
      deleted: { fee_payments: fpDeleted, payment_logs: logsDeleted }
    });
  } catch (error) {
    await txn.rollback();
    console.error('Error deleting session:', error);
    res.status(500).json({ success: false, message: 'Failed to delete session' });
  }
};

// PUT /api/admin/sessions/:id/activate
// Make a draft/inactive session live — deactivates all others in one transaction.
const activateSession = async (req, res) => {
  const txn = await sequelize.transaction();
  try {
    const { id } = req.params;
    const session = await Session.findByPk(id, { transaction: txn });
    if (!session) {
      await txn.rollback();
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    await Session.update({ is_active: false }, { where: {}, transaction: txn });
    await session.update({ is_active: true }, { transaction: txn });

    await txn.commit();
    res.json({ success: true, message: 'Session activated', session });
  } catch (error) {
    await txn.rollback();
    console.error('Error activating session:', error);
    res.status(500).json({ success: false, message: 'Failed to activate session' });
  }
};

// POST /api/admin/sessions/:id/promote
// Promote students to next class for a new session
const promoteStudents = async (req, res) => {
  const txn = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { promotions } = req.body; // array of { student_id, new_class_id }

    const session = await Session.findByPk(id, { transaction: txn });
    if (!session) {
      await txn.rollback();
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    for (const p of promotions) {
      await Student.update(
        { class_id: p.new_class_id, status: 'promoted' },
        { where: { id: p.student_id }, transaction: txn }
      );
    }

    await txn.commit();
    res.json({ success: true, message: `${promotions.length} students promoted successfully` });
  } catch (error) {
    await txn.rollback();
    console.error('Error promoting students:', error);
    res.status(500).json({ success: false, message: 'Failed to promote students' });
  }
};

module.exports = {
  getSessions,
  getActiveSession,
  getSessionById,
  createSession,
  updateSession,
  updateSessionFees,
  deleteSession,
  activateSession,
  promoteStudents
};
