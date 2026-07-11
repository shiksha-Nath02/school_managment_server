const { Op } = require('sequelize');
const sequelize = require('../config/database');
const BookItem = require('../models/BookItem');
const BookTransaction = require('../models/BookTransaction');
const BookPayment = require('../models/BookPayment');
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
    id:        txn.item.id,
    bookName:  txn.item.book_name,
    className: txn.item.class_name,
    subject:   txn.item.subject,
    price:     parseFloat(txn.item.price),
  } : null,
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
    const items = await BookItem.findAll({ order: [['book_name', 'ASC']] });
    res.json({ items: items.map((i) => ({ id: i.id, bookName: i.book_name, className: i.class_name, subject: i.subject, price: parseFloat(i.price), unitsAvailable: i.units_available })) });
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch items' });
  }
};

const addItem = async (req, res) => {
  try {
    const { book_name, class_name, subject, price, units_available } = req.body;
    if (!book_name || !price) return res.status(400).json({ message: 'book_name and price are required' });
    const item = await BookItem.create({ book_name, class_name: class_name || null, subject: subject || null, price: parseFloat(price), units_available: parseInt(units_available, 10) || 0 });
    res.status(201).json({ message: 'Book added', item: { id: item.id, bookName: item.book_name, className: item.class_name, subject: item.subject, price: parseFloat(item.price), unitsAvailable: item.units_available } });
  } catch (e) {
    res.status(500).json({ message: 'Failed to add book' });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await BookItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Book not found' });
    const { book_name, class_name, subject, price, units_available } = req.body;
    await item.update({
      book_name:       book_name       ?? item.book_name,
      class_name:      class_name      !== undefined ? class_name      : item.class_name,
      subject:         subject         !== undefined ? subject         : item.subject,
      price:           price           != null ? parseFloat(price)           : item.price,
      units_available: units_available != null ? parseInt(units_available, 10) : item.units_available,
    });
    res.json({ message: 'Book updated', item: { id: item.id, bookName: item.book_name, className: item.class_name, subject: item.subject, price: parseFloat(item.price), unitsAvailable: item.units_available } });
  } catch (e) {
    res.status(500).json({ message: 'Failed to update book' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await BookItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Book not found' });
    const inUse = await BookTransaction.count({ where: { item_id: item.id } });
    if (inUse > 0) return res.status(400).json({ message: 'Cannot delete — book has existing sales records' });
    await item.destroy();
    res.json({ message: 'Book deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete book' });
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

    const txns = await BookTransaction.findAll({
      where,
      include: [
        { model: BookItem, as: 'item' },
        { model: BookPayment, as: 'payments', order: [['payment_date', 'ASC']] },
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
    const item = await BookItem.findByPk(item_id);
    if (!item) return res.status(404).json({ message: 'Book not found' });
    if (item.units_available < qty) return res.status(400).json({ message: `Only ${item.units_available} copies available` });

    const gross    = parseFloat(item.price) * qty;
    const disc     = Math.min(Math.max(parseFloat(discount) || 0, 0), gross); // clamp to [0, gross]
    const toBePaid = gross - disc;
    const paying   = Math.min(parseFloat(amount_paying) || 0, toBePaid);

    // Link to a student by admission number (FK survives later edits;
    // unmatched/walk-in sales just stay unlinked).
    let student_id = null;
    if (admission_number) {
      const s = await Student.findOne({ where: { admission_number }, attributes: ['id'] });
      if (s) student_id = s.id;
    }

    const txn = await BookTransaction.create({
      student_name, father_phone, admission_number, student_id, item_id, quantity: qty,
      to_be_paid: toBePaid, discount: disc, paid: paying,
    }, { transaction: t });

    if (paying > 0) {
      await BookPayment.create({
        transaction_id: txn.id,
        amount_paid:    paying,
        payment_date:   new Date().toISOString().split('T')[0],
        payment_method: normMethod(payment_method),
      }, { transaction: t });
    }

    await item.update({ units_available: item.units_available - qty }, { transaction: t });
    await t.commit();

    const full = await BookTransaction.findByPk(txn.id, {
      include: [{ model: BookItem, as: 'item' }, { model: BookPayment, as: 'payments' }],
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
    const txn = await BookTransaction.findByPk(req.params.id);
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });

    const left = parseFloat(txn.to_be_paid) - parseFloat(txn.paid);
    if (left <= 0) return res.status(400).json({ message: 'Already fully paid' });

    const { amount, payment_date, remarks, payment_method } = req.body;
    const amt = Math.min(parseFloat(amount), left);
    if (!amt || amt <= 0) return res.status(400).json({ message: 'Invalid amount' });

    await BookPayment.create({
      transaction_id: txn.id,
      amount_paid:    amt,
      payment_date:   payment_date || new Date().toISOString().split('T')[0],
      payment_method: normMethod(payment_method),
      remarks:        remarks || null,
    }, { transaction: t });

    await txn.update({ paid: parseFloat(txn.paid) + amt }, { transaction: t });
    await t.commit();

    const full = await BookTransaction.findByPk(txn.id, {
      include: [{ model: BookItem, as: 'item' }, { model: BookPayment, as: 'payments' }],
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
    const txn = await BookTransaction.findByPk(req.params.id);
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });

    await BookPayment.destroy({ where: { transaction_id: txn.id }, transaction: t });
    await BookItem.increment('units_available', { by: txn.quantity, where: { id: txn.item_id }, transaction: t });
    await txn.destroy({ transaction: t });
    await t.commit();

    res.json({ message: 'Sale voided and stock restored' });
  } catch (e) {
    await t.rollback();
    res.status(500).json({ message: 'Failed to void transaction' });
  }
};

module.exports = { getItems, addItem, updateItem, deleteItem, getTransactions, sellItem, addPayment, deleteTransaction };
