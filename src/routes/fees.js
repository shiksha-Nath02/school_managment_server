const router = require('express').Router();
const sessionController = require('../controllers/sessionController');
const feeController = require('../controllers/feeController');

// ── Sessions ──────────────────────────────────────
// Specific paths must come before :id param routes
router.get('/sessions/active', sessionController.getActiveSession);
router.get('/sessions', sessionController.getSessions);
router.get('/sessions/:id', sessionController.getSessionById);
router.post('/sessions', sessionController.createSession);
router.put('/sessions/:id/fees', sessionController.updateSessionFees);
router.post('/sessions/:id/promote', sessionController.promoteStudents);

// ── Fee operations ────────────────────────────────
router.get('/fees/dues', feeController.getStudentsWithDues);
router.get('/fees/classwise', feeController.getClasswiseReport);
router.get('/fees/student/:id', feeController.getStudentFeeHistory);
router.post('/fees/pay', feeController.recordPayment);
router.post('/fees/bulk-pay', feeController.recordBulkPayment);
router.post('/fees/reverse/:id', feeController.recordReversal);

// ── Payment log ───────────────────────────────────
router.get('/payment-log', feeController.getPaymentLog);
router.post('/payment-log', feeController.addPaymentLogEntry);

// ── Profit ────────────────────────────────────────
router.get('/profit', feeController.getProfitReport);

module.exports = router;
