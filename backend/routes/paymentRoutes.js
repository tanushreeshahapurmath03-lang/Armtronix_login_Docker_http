const express = require('express');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.post('/api/payments', paymentController.createPayment);
router.get('/api/payments', paymentController.getAllPayments);
router.get('/api/payments/with-claims', paymentController.getPaymentsWithClaims);

module.exports = router;