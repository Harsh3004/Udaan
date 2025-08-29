const express = require('express');
const { sendOtp, signUp, login, changePassword } = require('../controllers/authController');
const { auth, isStudent, isInstructor, isAdmin } = require('../middlewares/Auth');
const {resetPasswordToken, resetPassword} = require('../controllers/resetPassword');
const router = express.Router();

// Auth routes
router.post('/sendOtp', sendOtp);
router.post('/signUp', signUp);
router.post('/login', login);
router.put('/changePassword', auth, changePassword);

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

module.exports = router;