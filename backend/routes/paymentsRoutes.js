const express = require('express');
const { auth, isStudent } = require('../middlewares/Auth');
const { capturePayment, verifyPayment } = require('../controllers/payment');
const router = express.Router();

// Payment routes
router.post('/create-order', auth , isStudent, capturePayment);
router.post('/verify', auth, isStudent, verifyPayment);

module.exports = router;