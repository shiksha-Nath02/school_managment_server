const { Session, StudentFee, Student, User, Class } = require('../models');
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
      excluded_months, fine_enabled, fine_per_day, grace_period_days,
      default_monthly_fee, copy_from_session_id, fee_increase_percent,
      student_fees // optional: array of { student_id, monthly_fee, discount, discount_reason }
    } = req.body;

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

    // Deactivate all other sessions
    await Session.update({ is_active: false }, { where: {}, transaction: txn });

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
      is_active: true,
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
  updateSessionFees,
  promoteStudents
};
