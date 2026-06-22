const router = require('express').Router();
const {
  getItems,
  addItem,
  updateItem,
  deleteItem,
  recordStockIn,
  recordStockOut,
  getItemTransactions,
  getAllTransactions,
  getStockReport,
} = require('../controllers/inventoryController');

// Report and all-transactions before /:id to avoid conflicts
router.get('/inventory/report', getStockReport);
router.get('/inventory/transactions', getAllTransactions);

// Items CRUD
router.get('/inventory', getItems);
router.post('/inventory', addItem);
router.put('/inventory/:id', updateItem);
router.delete('/inventory/:id', deleteItem);

// Stock movement
router.post('/inventory/:id/stock-in', recordStockIn);
router.post('/inventory/:id/stock-out', recordStockOut);

// Per-item transactions
router.get('/inventory/:id/transactions', getItemTransactions);

module.exports = router;
