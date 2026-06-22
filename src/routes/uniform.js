const router = require('express').Router();
const {
  getItems, addItem, updateItem, deleteItem,
  getTransactions, sellItem, addPayment, deleteTransaction,
} = require('../controllers/uniformController');

router.get('/uniform/items', getItems);
router.post('/uniform/items', addItem);
router.put('/uniform/items/:id', updateItem);
router.delete('/uniform/items/:id', deleteItem);

router.get('/uniform/transactions', getTransactions);
router.post('/uniform/transactions', sellItem);
router.post('/uniform/transactions/:id/payment', addPayment);
router.delete('/uniform/transactions/:id', deleteTransaction);

module.exports = router;
