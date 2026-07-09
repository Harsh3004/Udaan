const express = require('express');
const { sendOtp, signUp, login, changePassword, logout, googleAuth, deleteAccount } = require('../controllers/authController');
const {resetPasswordToken, resetPassword} = require('../controllers/resetPassword');
const { auth, isStudent, isInstructor, isAdmin } = require('../middlewares/Auth');
const { otpLimiter, loginLimiter, googleAuthLimiter } = require('../middlewares/rateLimiter');
const router = express.Router();

// Auth routes — rate limited on sensitive endpoints
router.post('/sendOtp', otpLimiter, sendOtp);
router.post('/signUp', signUp);
router.post('/login', loginLimiter, login);
router.get('/logout', logout);

router.put('/changePassword', auth, changePassword);
router.post('/google-auth', googleAuthLimiter, googleAuth);

// Reset Password route
router.put('/forgotPassword',resetPasswordToken);
router.put('/update-password',resetPassword);

// Role check routes
router.get('/', auth, (req, res) => res.json({
    success: true,
    message: 'Authenticate' 
}));

router.get('/student', auth, isStudent, (req, res) => res.json({
    success: true,
    message: 'Welcome Student' 
}));

router.get('/instructor', auth, isInstructor, (req, res) => res.json({
    success: true, 
    message: 'Welcome Instructor'
}));

router.get('/admin', auth, isAdmin, (req, res) => res.json({
    success: true,
    message: 'Welcome Admin' 
}));

router.delete('/delete-account', auth, deleteAccount);

module.exports = router;