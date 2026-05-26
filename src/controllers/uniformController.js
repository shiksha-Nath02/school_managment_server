const { Op } = require('sequelize');
const sequelize = require('../config/database');
const UniformItem = require('../models/UniformItem');
const UniformTransaction = require('../models/UniformTransaction');
const UniformPayment = require('../models/UniformPayment');
const Student = require('../models/Student');

const fmt = (txn) => ({
  id:              txn.id,
  studentName:     txn.student_name,
  fatherPhone:     txn.father_phone,
  admissionNumber: txn.admission_number,
  itemId:          txn.item_id,
  quantity:        txn.quantity,
  toBePaid:        parseFloat(txn.to_be_paid),
  paid:            parseFloat(txn.paid),
  left:            parseFloat(txn.to_be_paid) - parseFloat(txn.paid),
  createdAt:       txn.created_at,
  item:            txn.item ? {
    id:       txn.item.id,
    itemName: txn.item.item_name,
    size:     txn.item.size,
    price:    parseFloat(txn.item.price),
  } : null,
  payments: (txn.payments || []).map((p) => ({
    id:          p.id,
    amountPaid:  parseFloat(p.amount_paid),
    paymentDate: p.payment_date,
    remarks:     p.remarks,
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

const addItem = async (req, res) => {
  try {
    const { item_name, size, price, units_available } = req.body;
    if (!item_name || !size || !price) return res.status(400).json({ message: 'item_name, size, and price are required' });
    const item = await UniformItem.create({ item_name, size, price: parseFloat(price), units_available: parseInt(units_available, 10) || 0 });
    res.status(201).json({ message: 'Item added', item: { id: item.id, itemName: item.item_name, size: item.size, price: parseFloat(item.price), unitsAvailable: item.units_available } });
  } catch (e) {
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
        { model: UniformPayment, as: 'payments', order: [['payment_date', 'ASC']] },
      ],
      order: [['created_at', 'DESC']],
    });

    const admNos = [...new Set(txns.map(t => t.admission_number).filter(Boolean))];
    const studentMap = {};
    if (admNos.length) {
      const ids = admNos.map(n => parseInt(n, 10)).filter(n => !isNaN(n));
      if (ids.length) {
        const students = await Student.findAll({ where: { id: ids }, attributes: ['id', 'category'] });
        for (const s of students) studentMap[String(s.id)] = s.category;
      }
    }

    res.json({ transactions: txns.map(t => ({ ...fmt(t), studentCategory: studentMap[String(t.admission_number)] || null })) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

const sellItem = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { student_name, father_phone, admission_number, item_id, quantity, amount_paying } = req.body;
    if (!student_name || !item_id) return res.status(400).json({ message: 'student_name and item_id are required' });

    const qty = parseInt(quantity, 10) || 1;
    const item = await UniformItem.findByPk(item_id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.units_available < qty) return res.status(400).json({ message: `Only ${item.units_available} units available` });

    const toBePaid = parseFloat(item.price) * qty;
    const paying  = Math.min(parseFloat(amount_paying) || 0, toBePaid);

    const txn = await UniformTransaction.create({
      student_name, father_phone, admission_number, item_id, quantity: qty,
      to_be_paid: toBePaid, paid: paying,
    }, { transaction: t });

    if (paying > 0) {
      await UniformPayment.create({
        transaction_id: txn.id,
        amount_paid:    paying,
        payment_date:   new Date().toISOString().split('T')[0],
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

const addPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const txn = await UniformTransaction.findByPk(req.params.id);
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });

    const left = parseFloat(txn.to_be_paid) - parseFloat(txn.paid);
    if (left <= 0) return res.status(400).json({ message: 'Already fully paid' });

    const { amount, payment_date, remarks } = req.body;
    const amt = Math.min(parseFloat(amount), left);
    if (!amt || amt <= 0) return res.status(400).json({ message: 'Invalid amount' });

    await UniformPayment.create({
      transaction_id: txn.id,
      amount_paid:    amt,
      payment_date:   payment_date || new Date().toISOString().split('T')[0],
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
    await UniformItem.increment('units_available', { by: txn.quantity, where: { id: txn.item_id }, transaction: t });
    await txn.destroy({ transaction: t });
    await t.commit();

    res.json({ message: 'Sale voided and stock restored' });
  } catch (e) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to void transaction' });
  }
};

module.exports = { getItems, addItem, updateItem, deleteItem, getTransactions, sellItem, addPayment, deleteTransaction };
