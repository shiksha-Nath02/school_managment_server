const { Op } = require('sequelize');
const { Handover, PaymentLog, FeePayment, UniformPayment, BookPayment, Expense } = require('../models');

// Anything that isn't plain cash counts as "online" for reconciliation
// (upi / cheque / bank_transfer / online). NULL rows never match Op.notIn, so
// they fall into the cash residual — see getHandoverSummary.
const dateRange = (col, from, to) => {
  if (from && to) return { [col]: { [Op.between]: [from, to] } };
  if (from)       return { [col]: { [Op.gte]: from } };
  if (to)         return { [col]: { [Op.lte]: to } };
  return {};
};

const ymd = (d) => (typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10));

// POST /api/admin/handovers  { date, cash_amount, online_amount, remarks }
const createHandover = async (req, res) => {
  try {
    const { date, cash_amount, online_amount, remarks } = req.body;
    if (!date) return res.status(400).json({ message: 'date is required' });
    const cash   = Math.max(parseFloat(cash_amount)   || 0, 0);
    const online = Math.max(parseFloat(online_amount) || 0, 0);
    if (cash === 0 && online === 0) {
      return res.status(400).json({ message: 'Enter a cash and/or online amount' });
    }
    const entry = await Handover.create({
      date,
      cash_amount:   cash,
      online_amount: online,
      remarks:       remarks || null,
      recorded_by:   req.user?.id || null,
    });
    res.status(201).json({ message: 'Handover recorded', handover: fmt(entry) });
  } catch (e) {
    console.error('Create handover error:', e);
    res.status(500).json({ message: 'Failed to record handover' });
  }
};

// GET /api/admin/handovers?from=&to=
const getHandovers = async (req, res) => {
  try {
    const { from, to } = req.query;
    const rows = await Handover.findAll({
      where: dateRange('date', from, to),
      order: [['date', 'DESC'], ['id', 'DESC']],
    });
    res.json({ handovers: rows.map(fmt) });
  } catch (e) {
    console.error('Get handovers error:', e);
    res.status(500).json({ message: 'Failed to fetch handovers' });
  }
};

// DELETE /api/admin/handovers/:id
const deleteHandover = async (req, res) => {
  try {
    const h = await Handover.findByPk(req.params.id);
    if (!h) return res.status(404).json({ message: 'Handover not found' });
    await h.destroy();
    res.json({ message: 'Handover deleted' });
  } catch (e) {
    console.error('Delete handover error:', e);
    res.status(500).json({ message: 'Failed to delete handover' });
  }
};

// GET /api/admin/handover-summary?from=&to=
// Returns income / expenditure / handover, each split into { cash, online, total }.
// Totals mirror the Profit report exactly; the cash/online SPLIT is derived from
// the method-bearing source tables, with cash as the residual so nothing is lost.
const getHandoverSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const sum = async (Model, col, where) => parseFloat((await Model.sum(col, { where })) || 0);
    const notCash = { payment_method: { [Op.notIn]: ['cash'] } }; // excludes cash AND null

    // ── Income (same sources as the profit report) ──
    const [plIncome, uniIncome, bookIncome] = await Promise.all([
      sum(PaymentLog, 'amount', { ...dateRange('date', from, to), direction: 'income' }),
      sum(UniformPayment, 'amount_paid', dateRange('payment_date', from, to)),
      sum(BookPayment, 'amount_paid', dateRange('payment_date', from, to)),
    ]);
    const totalIncome = plIncome + uniIncome + bookIncome;

    // Online (non-cash) income from method-bearing rows. Fee rows carry both the
    // fee and its fine on the same row, so add fine_amount too. System-generated
    // (₹0) rows are excluded; reversals (negative) net out.
    const feeWhere = { ...dateRange('payment_date', from, to), is_system_generated: false, ...notCash };
    const [feeOnline, feeFineOnline, uniOnline, bookOnline] = await Promise.all([
      sum(FeePayment, 'amount_paid', feeWhere),
      sum(FeePayment, 'fine_amount', feeWhere),
      sum(UniformPayment, 'amount_paid', { ...dateRange('payment_date', from, to), ...notCash }),
      sum(BookPayment, 'amount_paid', { ...dateRange('payment_date', from, to), ...notCash }),
    ]);
    const onlineIncome = feeOnline + feeFineOnline + uniOnline + bookOnline;
    const cashIncome = totalIncome - onlineIncome; // residual: cash fees + admission + misc

    // ── Expenditure ──
    const [totalExp, onlineExp] = await Promise.all([
      sum(Expense, 'amount', dateRange('date', from, to)),
      sum(Expense, 'amount', { ...dateRange('date', from, to), payment_method: 'online' }),
    ]);
    const cashExp = totalExp - onlineExp;

    // ── Handover (what was actually handed over) ──
    const [hoCash, hoOnline] = await Promise.all([
      sum(Handover, 'cash_amount', dateRange('date', from, to)),
      sum(Handover, 'online_amount', dateRange('date', from, to)),
    ]);

    res.json({
      income:      { cash: cashIncome,        online: onlineIncome,  total: totalIncome },
      expenditure: { cash: cashExp,           online: onlineExp,     total: totalExp },
      handover:    { cash: hoCash,            online: hoOnline,      total: hoCash + hoOnline },
    });
  } catch (e) {
    console.error('Handover summary error:', e);
    res.status(500).json({ message: 'Failed to compute handover summary' });
  }
};

function fmt(h) {
  const cash = parseFloat(h.cash_amount);
  const online = parseFloat(h.online_amount);
  return {
    id:      h.id,
    date:    ymd(h.date),
    cash,
    online,
    total:   cash + online,
    remarks: h.remarks,
  };
}

module.exports = { createHandover, getHandovers, deleteHandover, getHandoverSummary };
