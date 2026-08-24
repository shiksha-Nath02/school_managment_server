const { Op } = require('sequelize');
const { Holiday } = require('../models');
const { istToday } = require('../utils/dateUtils');

// ──────────────────────────────────────────────────
// HOLIDAYS (school-wide non-working days)
// Sundays are off by default in code and are NOT stored here — this table holds
// only explicit, admin-declared holidays. Used by the dashboard (don't flag a
// class as "attendance pending" on a holiday) and attendance stats.
// ──────────────────────────────────────────────────

// GET /api/admin/holidays?from=YYYY-MM-DD&to=YYYY-MM-DD
// Defaults to the current calendar year when no range is given.
const listHolidays = async (req, res) => {
  try {
    let { from, to } = req.query;
    if (!from || !to) {
      const year = istToday().slice(0, 4);
      from = `${year}-01-01`;
      to = `${year}-12-31`;
    }
    const holidays = await Holiday.findAll({
      where: { date: { [Op.between]: [from, to] } },
      order: [['date', 'ASC']],
    });
    res.json({
      success: true,
      holidays: holidays.map((h) => ({ id: h.id, date: h.date, reason: h.reason })),
    });
  } catch (error) {
    console.error('List holidays error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch holidays' });
  }
};

// POST /api/admin/holidays  { date, reason }
const addHoliday = async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date || !reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Date and reason are required.' });
    }
    // DATEONLY sanity check (YYYY-MM-DD).
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: 'Invalid date format (expected YYYY-MM-DD).' });
    }

    const existing = await Holiday.findOne({ where: { date } });
    if (existing) {
      // Idempotent-ish: update the reason if the date is already a holiday.
      await existing.update({ reason: reason.trim() });
      return res.json({
        success: true,
        holiday: { id: existing.id, date: existing.date, reason: existing.reason },
        message: 'Holiday updated.',
      });
    }

    const holiday = await Holiday.create({
      date,
      reason: reason.trim(),
      created_by: req.user?.id || null,
    });
    res.status(201).json({
      success: true,
      holiday: { id: holiday.id, date: holiday.date, reason: holiday.reason },
    });
  } catch (error) {
    console.error('Add holiday error:', error);
    res.status(500).json({ success: false, message: 'Failed to add holiday' });
  }
};

// DELETE /api/admin/holidays/:id
const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findByPk(id);
    if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found' });
    await holiday.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete holiday error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete holiday' });
  }
};

module.exports = { listHolidays, addHoliday, deleteHoliday };
