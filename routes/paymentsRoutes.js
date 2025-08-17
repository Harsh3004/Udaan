const express = require('express');
const { auth } = require('../middlewares/Auth');
const { capturePayment, verifyPayment } = require('../controllers/payment');
const router = express.Router();

// Payment routes
router.post('/initiate', auth, capturePayment);
router.post('/verify', auth, verifyPayment);

module.exports = router;