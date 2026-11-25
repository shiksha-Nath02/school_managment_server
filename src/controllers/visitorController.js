const { Op } = require('sequelize');
const { Visitor } = require('../models');

const fmt = (v) => ({
  id:         v.id,
  name:       v.name,
  phone:      v.phone,
  purpose:    v.purpose,
  whomToMeet: v.whomToMeet,
  numPersons: v.numPersons,
  visitDate:  v.visitDate,
  timeIn:     v.timeIn,
  timeOut:    v.timeOut,
  remarks:    v.remarks,
  createdAt:  v.created_at,
});

// Server is pinned to IST, so new Date() is already local time.
const todayISO = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
};

const clean = (s, max) => (s != null && String(s).trim() ? String(s).trim().slice(0, max) : null);

// ─── List visitors (defaults to today; optional date / date range / search) ───
const getVisitors = async (req, res) => {
  try {
    const { date, from, to, q } = req.query;
    const w = {};
    if (date) {
      w.visit_date = date;
    } else if (from || to) {
      w.visit_date = {};
      if (from) w.visit_date[Op.gte] = from;
      if (to) w.visit_date[Op.lte] = to;
    } else {
      w.visit_date = todayISO();
    }
    if (q && String(q).trim()) {
      const like = { [Op.like]: `%${String(q).trim()}%` };
      w[Op.or] = [{ name: like }, { phone: like }, { whom_to_meet: like }, { purpose: like }];
    }
    const visitors = await Visitor.findAll({ where: w, order: [['time_in', 'DESC'], ['id', 'DESC']] });
    res.json({ visitors: visitors.map(fmt) });
  } catch (e) {
    console.error('Get visitors error:', e);
    res.status(500).json({ message: 'Failed to fetch visitors' });
  }
};

// ─── Log a new visitor (check-in) ─────────────────────────────────────────────
const createVisitor = async (req, res) => {
  try {
    const { name, phone, purpose, whomToMeet, numPersons, remarks, visitDate } = req.body;
    if (!name || !String(name).trim()) return res.status(400).json({ message: 'Visitor name is required' });

    const n = parseInt(numPersons, 10);
    const visitor = await Visitor.create({
      name:       clean(name, 150),
      phone:      clean(phone, 20),
      purpose:    clean(purpose, 255),
      whomToMeet: clean(whomToMeet, 150),
      numPersons: Number.isFinite(n) && n > 0 ? n : 1,
      remarks:    clean(remarks, 2000),
      visitDate:  visitDate || todayISO(),
      timeIn:     new Date(),
    });
    res.status(201).json({ message: 'Visitor logged', visitor: fmt(visitor) });
  } catch (e) {
    console.error('Create visitor error:', e);
    res.status(500).json({ message: 'Failed to log visitor' });
  }
};

// ─── Update a visitor (edit details or check out) ─────────────────────────────
const updateVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByPk(req.params.id);
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });

    const { name, phone, purpose, whomToMeet, numPersons, remarks, checkout } = req.body;
    const patch = {};
    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ message: 'Visitor name is required' });
      patch.name = clean(name, 150);
    }
    if (phone !== undefined) patch.phone = clean(phone, 20);
    if (purpose !== undefined) patch.purpose = clean(purpose, 255);
    if (whomToMeet !== undefined) patch.whomToMeet = clean(whomToMeet, 150);
    if (remarks !== undefined) patch.remarks = clean(remarks, 2000);
    if (numPersons !== undefined) {
      const n = parseInt(numPersons, 10);
      patch.numPersons = Number.isFinite(n) && n > 0 ? n : 1;
    }
    // checkout: true stamps now; false clears it (undo a checkout)
    if (checkout === true) patch.timeOut = visitor.timeOut || new Date();
    else if (checkout === false) patch.timeOut = null;

    await visitor.update(patch);
    res.json({ message: 'Visitor updated', visitor: fmt(visitor) });
  } catch (e) {
    console.error('Update visitor error:', e);
    res.status(500).json({ message: 'Failed to update visitor' });
  }
};

// ─── Delete a visitor row ─────────────────────────────────────────────────────
const deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByPk(req.params.id);
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });
    await visitor.destroy();
    res.json({ message: 'Visitor deleted' });
  } catch (e) {
    console.error('Delete visitor error:', e);
    res.status(500).json({ message: 'Failed to delete visitor' });
  }
};

module.exports = { getVisitors, createVisitor, updateVisitor, deleteVisitor };
