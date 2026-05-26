const { Op } = require('sequelize');
const { Inventory, InventoryTransaction, sequelize } = require('../models');

const VALID_CATEGORIES = ['pantry', 'stationary', 'books', 'uniform'];

// ─────────── ITEMS ───────────

const getItems = async (req, res) => {
  try {
    const { category } = req.query;
    const where = {};
    if (category) {
      if (!VALID_CATEGORIES.includes(category))
        return res.status(400).json({ message: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
      where.category = category;
    }
    const items = await Inventory.findAll({ where, order: [['category', 'ASC'], ['item_name', 'ASC']] });
    res.json({ items });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory' });
  }
};

const addItem = async (req, res) => {
  try {
    const { item_name, category, quantity, price, description } = req.body;
    if (!item_name || !category)
      return res.status(400).json({ message: 'item_name and category are required' });
    if (!VALID_CATEGORIES.includes(category))
      return res.status(400).json({ message: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });

    const item = await Inventory.create({
      item_name,
      category,
      quantity: quantity !== undefined ? parseInt(quantity, 10) : 0,
      price: price || null,
      description: description || null,
    });
    res.status(201).json({ message: 'Item added', item });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ message: 'Failed to add item' });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const { item_name, category, price, description } = req.body;
    if (category && !VALID_CATEGORIES.includes(category))
      return res.status(400).json({ message: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });

    const updates = {};
    if (item_name !== undefined) updates.item_name = item_name;
    if (category !== undefined) updates.category = category;
    if (price !== undefined) updates.price = price;
    if (description !== undefined) updates.description = description;

    await item.update(updates);
    res.json({ message: 'Item updated', item });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Failed to update item' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    await item.destroy();
    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Failed to delete item' });
  }
};

// ─────────── STOCK MOVEMENT ───────────

const recordStockIn = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { quantity, unit_price, reference_note, date } = req.body;
    if (!quantity || parseInt(quantity, 10) <= 0)
      return res.status(400).json({ message: 'quantity must be a positive number' });

    const item = await Inventory.findByPk(id, { lock: true, transaction: t });
    if (!item) { await t.rollback(); return res.status(404).json({ message: 'Item not found' }); }

    const qty = parseInt(quantity, 10);
    const unitPrice = unit_price ? parseFloat(unit_price) : null;
    const totalAmount = unitPrice ? unitPrice * qty : null;

    await item.update({ quantity: item.quantity + qty }, { transaction: t });
    const txn = await InventoryTransaction.create({
      item_id: item.id,
      type: 'purchase',
      quantity: qty,
      unit_price: unitPrice,
      total_amount: totalAmount,
      reference_note: reference_note || null,
      date: date || new Date().toISOString().split('T')[0],
    }, { transaction: t });

    await t.commit();
    res.json({ message: 'Stock added', newQuantity: item.quantity + qty, transaction: txn });
  } catch (error) {
    await t.rollback();
    console.error('Stock-in error:', error);
    res.status(500).json({ message: 'Failed to record stock-in' });
  }
};

const recordStockOut = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { type, quantity, unit_price, reference_note, date, student_id } = req.body;
    if (!type || !['sale', 'distribute'].includes(type))
      return res.status(400).json({ message: 'type must be sale or distribute' });
    if (!quantity || parseInt(quantity, 10) <= 0)
      return res.status(400).json({ message: 'quantity must be a positive number' });

    const item = await Inventory.findByPk(id, { lock: true, transaction: t });
    if (!item) { await t.rollback(); return res.status(404).json({ message: 'Item not found' }); }

    const qty = parseInt(quantity, 10);
    if (item.quantity < qty) {
      await t.rollback();
      return res.status(400).json({ message: `Insufficient stock. Available: ${item.quantity}` });
    }

    const unitPrice = unit_price ? parseFloat(unit_price) : null;
    const totalAmount = unitPrice ? unitPrice * qty : null;

    await item.update({ quantity: item.quantity - qty }, { transaction: t });
    const txn = await InventoryTransaction.create({
      item_id: item.id,
      student_id: student_id ? parseInt(student_id, 10) : null,
      type,
      quantity: qty,
      unit_price: unitPrice,
      total_amount: totalAmount,
      reference_note: reference_note || null,
      date: date || new Date().toISOString().split('T')[0],
    }, { transaction: t });

    await t.commit();
    res.json({ message: `Stock ${type} recorded`, newQuantity: item.quantity - qty, transaction: txn });
  } catch (error) {
    await t.rollback();
    console.error('Stock-out error:', error);
    res.status(500).json({ message: 'Failed to record stock-out' });
  }
};

// ─────────── TRANSACTIONS ───────────

const getItemTransactions = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const { type, start_date, end_date } = req.query;
    const where = { item_id: req.params.id };
    if (type) where.type = type;
    if (start_date && end_date) where.date = { [Op.between]: [start_date, end_date] };

    const transactions = await InventoryTransaction.findAll({
      where,
      order: [['date', 'DESC'], ['id', 'DESC']],
    });
    res.json({ item: { id: item.id, item_name: item.item_name, category: item.category, quantity: item.quantity }, transactions });
  } catch (error) {
    console.error('Get item transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const { category, type, start_date, end_date } = req.query;
    const where = {};
    if (type) where.type = type;
    if (start_date && end_date) where.date = { [Op.between]: [start_date, end_date] };

    const itemWhere = {};
    if (category) itemWhere.category = category;

    const transactions = await InventoryTransaction.findAll({
      where,
      include: [{
        model: Inventory,
        as: 'item',
        attributes: ['id', 'item_name', 'category'],
        where: Object.keys(itemWhere).length ? itemWhere : undefined,
      }],
      order: [['date', 'DESC'], ['id', 'DESC']],
    });
    res.json({ transactions });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

// ─────────── REPORT ───────────

const getStockReport = async (req, res) => {
  try {
    const items = await Inventory.findAll({ order: [['category', 'ASC'], ['item_name', 'ASC']] });

    const report = {};
    for (const item of items) {
      if (!report[item.category]) {
        report[item.category] = { category: item.category, itemCount: 0, totalValue: 0, items: [] };
      }
      const value = parseFloat(item.price || 0) * item.quantity;
      report[item.category].items.push({
        id: item.id,
        name: item.item_name,
        quantity: item.quantity,
        price: item.price,
        totalValue: value,
        description: item.description,
      });
      report[item.category].itemCount++;
      report[item.category].totalValue += value;
    }

    res.json({ report: Object.values(report) });
  } catch (error) {
    console.error('Stock report error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
};

module.exports = {
  getItems,
  addItem,
  updateItem,
  deleteItem,
  recordStockIn,
  recordStockOut,
  getItemTransactions,
  getAllTransactions,
  getStockReport,
};
