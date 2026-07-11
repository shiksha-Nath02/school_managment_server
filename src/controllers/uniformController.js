const { Op } = require('sequelize');
const sequelize = require('../config/database');
const UniformItem = require('../models/UniformItem');
const UniformTransaction = require('../models/UniformTransaction');
const UniformTransactionItem = require('../models/UniformTransactionItem');
const UniformPayment = require('../models/UniformPayment');
const Student = require('../models/Student');

// Accepted payment methods (mirrors fee_payments.payment_method). Anything else
// (or empty) is stored as NULL rather than rejected, so a sale never fails on it.
const PAYMENT_METHODS = ['cash', 'upi', 'cheque', 'bank_transfer', 'online'];
const normMethod = (m) => (PAYMENT_METHODS.includes(m) ? m : null);

const fmt = (txn) => ({
  id:              txn.id,
  studentName:     txn.student_name,
  fatherPhone:     txn.father_phone,
  admissionNumber: txn.admission_number,
  itemId:          txn.item_id,
  quantity:        txn.quantity,
  discount:        parseFloat(txn.discount || 0),
  gross:           parseFloat(txn.to_be_paid) + parseFloat(txn.discount || 0),
  toBePaid:        parseFloat(txn.to_be_paid),
  paid:            parseFloat(txn.paid),
  left:            parseFloat(txn.to_be_paid) - parseFloat(txn.paid),
  createdAt:       txn.createdAt,
  item:            txn.item ? {
    id:       txn.item.id,
    itemName: txn.item.item_name,
    size:     txn.item.size,
    price:    parseFloat(txn.item.price),
  } : null,
  // Multi-item sales list their lines here; legacy single-item sales leave this empty.
  items: (txn.items || []).map((li) => ({
    id:        li.id,
    itemId:    li.item_id,
    itemName:  li.item ? li.item.item_name : null,
    size:      li.item ? li.item.size : null,
    quantity:  li.quantity,
    unitPrice: parseFloat(li.unit_price),
    lineTotal: parseFloat(li.line_total),
  })),
  payments: (txn.payments || []).map((p) => ({
    id:            p.id,
    amountPaid:    parseFloat(p.amount_paid),
    paymentDate:   p.payment_date,
    paymentMethod: p.payment_method,
    remarks:       p.remarks,
  })),
});

// ─── ITEMS ───────────────────────────────────────────────────────────────────

const getItems = async (req, res) => {
  try {
    const items = await UniformItem.findAll({ order: [['item_name', 'ASC'], ['size', 'ASC']] });
    res.json({ items: items.map((i) => ({ id: i.id, itemName: i.item_name, size: i.size, price: parseFloat(i.price), unitsAvailable: i.units_available })) });
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch items' });
  }
};

const toApi = (i) => ({ id: i.id, itemName: i.item_name, size: i.size, price: parseFloat(i.price), unitsAvailable: i.units_available });

// Accepts either a single size:
//   { item_name, size, price, units_available }
// or one item name with many sizes in a single submit:
//   { item_name, variants: [ { size, price, units_available }, ... ] }
const addItem = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { item_name, variants } = req.body;
    if (!item_name) return res.status(400).json({ message: 'item_name is required' });

    // Normalise both shapes into a list of { size, price, units_available }.
    const rows = Array.isArray(variants) && variants.length
      ? variants
      : [{ size: req.body.size, price: req.body.price, units_available: req.body.units_available }];

    // Validate every row up front so we don't create a partial set.
    const seen = new Set();
    for (const r of rows) {
      if (!r.size || r.price == null || r.price === '') {
        await t.rollback();
        return res.status(400).json({ message: 'Each size needs a size and price' });
      }
      const key = String(r.size).trim().toLowerCase();
      if (seen.has(key)) {
        await t.rollback();
        return res.status(400).json({ message: `Duplicate size "${r.size}" in this submission` });
      }
      seen.add(key);
    }

    const created = [];
    for (const r of rows) {
      const item = await UniformItem.create({
        item_name,
        size:            String(r.size).trim(),
        price:           parseFloat(r.price),
        units_available: parseInt(r.units_available, 10) || 0,
      }, { transaction: t });
      created.push(item);
    }

    await t.commit();
    res.status(201).json({
      message: `Added ${created.length} size${created.length === 1 ? '' : 's'}`,
      items:   created.map(toApi),
      item:    toApi(created[0]), // backwards-compatible single-item field
    });
  } catch (e) {
    await t.rollback();
    console.error(e);
    res.status(500).json({ message: 'Failed to add item' });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await UniformItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    const { item_name, size, price, units_available } = req.body;
    await item.update({
      item_name:       item_name       ?? item.item_name,
      size:            size            ?? item.size,
      price:           price           != null ? parseFloat(price) : item.price,
      units_available: units_available != null ? parseInt(units_available, 10) : item.units_available,
    });
    res.json({ message: 'Item updated', item: { id: item.id, itemName: item.item_name, size: item.size, price: parseFloat(item.price), unitsAvailable: item.units_available } });
  } catch (e) {
    res.status(500).json({ message: 'Failed to update item' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await UniformItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    const inUse = await UniformTransaction.count({ where: { item_id: item.id } });
    if (inUse > 0) return res.status(400).json({ message: 'Cannot delete — item has existing sales records' });
    await item.destroy();
    res.json({ message: 'Item deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete item' });
  }
};

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

const getTransactions = async (req, res) => {
  try {
    const { search } = req.query;
    const where = search ? {
      [Op.or]: [
        { student_name:     { [Op.like]: `%${search}%` } },
        { admission_number: { [Op.like]: `%${search}%` } },
        { father_phone:     { [Op.like]: `%${search}%` } },
      ],
    } : {};

    const txns = await UniformTransaction.findAll({
      where,
      include: [
        { model: UniformItem, as: 'item' },
        { model: UniformTransactionItem, as: 'items', include: [{ model: UniformItem, as: 'item' }] },
        { model: UniformPayment, as: 'payments', order: [['payment_date', 'ASC']] },
      ],
      order: [['created_at', 'DESC']],
    });

    // Category comes from the linked student via the student_id FK — NOT from
    // admission_number (which is not the students PK; matching the two is wrong).
    const studentIds = [...new Set(txns.map(t => t.student_id).filter(Boolean))];
    const studentMap = {};
    if (studentIds.length) {
      const students = await Student.findAll({ where: { id: studentIds }, attributes: ['id', 'category'] });
      for (const s of students) studentMap[String(s.id)] = s.category;
    }

    res.json({ transactions: txns.map(t => ({ ...fmt(t), studentCategory: studentMap[String(t.student_id)] || null })) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

const sellItem = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { student_name, father_phone, admission_number, item_id, quantity, amount_paying, discount, payment_method } = req.body;
    if (!student_name || !item_id) return res.status(400).json({ message: 'student_name and item_id are required' });

    const qty = parseInt(quantity, 10) || 1;
    const item = await UniformItem.findByPk(item_id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.units_available < qty) return res.status(400).json({ message: `Only ${item.units_available} units available` });

    const gross    = parseFloat(item.price) * qty;
    const disc     = Math.min(Math.max(parseFloat(discount) || 0, 0), gross); // clamp to [0, gross]
    const toBePaid = gross - disc;
    const paying   = Math.min(parseFloat(amount_paying) || 0, toBePaid);

    // Link to a student by admission number (the FK survives later edits;
    // unmatched/walk-in sales just stay unlinked).
    let student_id = null;
    if (admission_number) {
      const s = await Student.findOne({ where: { admission_number }, attributes: ['id'] });
      if (s) student_id = s.id;
    }

    const txn = await UniformTransaction.create({
      student_name, father_phone, admission_number, student_id, item_id, quantity: qty,
      to_be_paid: toBePaid, discount: disc, paid: paying,
    }, { transaction: t });

    if (paying > 0) {
      await UniformPayment.create({
        transaction_id: txn.id,
        amount_paid:    paying,
        payment_date:   new Date().toISOString().split('T')[0],
        payment_method: normMethod(payment_method),
      }, { transaction: t });
    }

    await item.update({ units_available: item.units_available - qty }, { transaction: t });
    await t.commit();

    const full = await UniformTransaction.findByPk(txn.id, {
      include: [{ model: UniformItem, as: 'item' }, { model: UniformPayment, as: 'payments' }],
    });
    res.status(201).json({ message: 'Sale recorded', transaction: fmt(full) });
  } catch (e) {
    await t.rollback();
    console.error(e);
    res.status(500).json({ message: 'Failed to record sale' });
  }
};

// Multi-item sale: one bill for a student carrying several items, with a single
// cart-level discount and a single "paying now" amount. Creates one parent
// transaction (the sale) + one uniform_transaction_items row per line.
const sellItems = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { student_name, father_phone, admission_number, items, amount_paying, discount, payment_method } = req.body;
    if (!student_name || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'student_name and at least one item are required' });
    }

    // Validate each line, lock the item row, and check stock.
    let gross = 0;
    let totalQty = 0;
    const resolved = [];
    for (const line of items) {
      const qty = parseInt(line.quantity, 10) || 1;
      if (qty <= 0) { await t.rollback(); return res.status(400).json({ message: 'Quantity must be at least 1' }); }
      const item = await UniformItem.findByPk(line.item_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!item) { await t.rollback(); return res.status(404).json({ message: `Item ${line.item_id} not found` }); }
      if (item.units_available < qty) {
        await t.rollback();
        return res.status(400).json({ message: `Only ${item.units_available} of ${item.item_name} (${item.size}) available` });
      }
      const unitPrice = parseFloat(item.price);
      const lineTotal = unitPrice * qty;
      gross += lineTotal;
      totalQty += qty;
      resolved.push({ item, qty, unitPrice, lineTotal });
    }

    const disc     = Math.min(Math.max(parseFloat(discount) || 0, 0), gross); // clamp to [0, gross]
    const toBePaid = gross - disc;
    const paying   = Math.min(parseFloat(amount_paying) || 0, toBePaid);

    let student_id = null;
    if (admission_number) {
      const s = await Student.findOne({ where: { admission_number }, attributes: ['id'] });
      if (s) student_id = s.id;
    }

    // Parent sale row. item_id stays NULL — the lines live in the child table.
    const txn = await UniformTransaction.create({
      student_name, father_phone, admission_number, student_id,
      item_id: null, quantity: totalQty,
      to_be_paid: toBePaid, discount: disc, paid: paying,
    }, { transaction: t });

    for (const r of resolved) {
      await UniformTransactionItem.create({
        transaction_id: txn.id,
        item_id:        r.item.id,
        quantity:       r.qty,
        unit_price:     r.unitPrice,
        line_total:     r.lineTotal,
      }, { transaction: t });
      await r.item.update({ units_available: r.item.units_available - r.qty }, { transaction: t });
    }

    if (paying > 0) {
      await UniformPayment.create({
        transaction_id: txn.id,
        amount_paid:    paying,
        payment_date:   new Date().toISOString().split('T')[0],
        payment_method: normMethod(payment_method),
      }, { transaction: t });
    }

    await t.commit();

    const full = await UniformTransaction.findByPk(txn.id, {
      include: [
        { model: UniformTransactionItem, as: 'items', include: [{ model: UniformItem, as: 'item' }] },
        { model: UniformPayment, as: 'payments' },
      ],
    });
    res.status(201).json({ message: 'Sale recorded', transaction: fmt(full) });
  } catch (e) {
    await t.rollback();
    console.error(e);
    res.status(500).json({ message: 'Failed to record sale' });
  }
};

const addPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const txn = await UniformTransaction.findByPk(req.params.id);
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });

    const left = parseFloat(txn.to_be_paid) - parseFloat(txn.paid);
    if (left <= 0) return res.status(400).json({ message: 'Already fully paid' });

    const { amount, payment_date, remarks, payment_method } = req.body;
    const amt = Math.min(parseFloat(amount), left);
    if (!amt || amt <= 0) return res.status(400).json({ message: 'Invalid amount' });

    await UniformPayment.create({
      transaction_id: txn.id,
      amount_paid:    amt,
      payment_date:   payment_date || new Date().toISOString().split('T')[0],
      payment_method: normMethod(payment_method),
      remarks:        remarks || null,
    }, { transaction: t });

    await txn.update({ paid: parseFloat(txn.paid) + amt }, { transaction: t });
    await t.commit();

    const full = await UniformTransaction.findByPk(txn.id, {
      include: [{ model: UniformItem, as: 'item' }, { model: UniformPayment, as: 'payments' }],
    });
    res.json({ message: 'Payment recorded', transaction: fmt(full) });
  } catch (e) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to record payment' });
  }
};

const deleteTransaction = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const txn = await UniformTransaction.findByPk(req.params.id);
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });

    await UniformPayment.destroy({ where: { transaction_id: txn.id }, transaction: t });

    // Restore stock. Multi-item sales carry their lines in the child table;
    // legacy single-item sales carry item_id/quantity inline.
    const lines = await UniformTransactionItem.findAll({ where: { transaction_id: txn.id }, transaction: t });
    if (lines.length > 0) {
      for (const li of lines) {
        await UniformItem.increment('units_available', { by: li.quantity, where: { id: li.item_id }, transaction: t });
      }
      await UniformTransactionItem.destroy({ where: { transaction_id: txn.id }, transaction: t });
    } else if (txn.item_id) {
      await UniformItem.increment('units_available', { by: txn.quantity, where: { id: txn.item_id }, transaction: t });
    }

    await txn.destroy({ transaction: t });
    await t.commit();

    res.json({ message: 'Sale voided and stock restored' });
  } catch (e) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to void transaction' });
  }
};

module.exports = { getItems, addItem, updateItem, deleteItem, getTransactions, sellItem, sellItems, addPayment, deleteTransaction };
