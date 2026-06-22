const router = require('express').Router();
const {
  getItems, addItem, updateItem, deleteItem,
  getTransactions, sellItem, addPayment, deleteTransaction,
} = require('../controllers/bookController');

router.get('/books/items', getItems);
router.post('/books/items', addItem);
router.put('/books/items/:id', updateItem);
router.delete('/books/items/:id', deleteItem);

router.get('/books/transactions', getTransactions);
router.post('/books/transactions', sellItem);
router.post('/books/transactions/:id/payment', addPayment);
router.delete('/books/transactions/:id', deleteTransaction);

module.exports = router;
