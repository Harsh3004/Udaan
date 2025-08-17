const express = require('express');
const { sendOtp, signUp, login, changePassword } = require('../controllers/authController');
const { auth, isStudent, isInstructor, isAdmin } = require('../middlewares/Auth');
const router = express.Router();

// Auth routes
router.post('/sendOtp', sendOtp);
router.post('/signUp', signUp);
router.post('/login', login);
router.post('/changePassword', auth, changePassword);

// Role check routes
router.get('/auth', auth, (req, res) => res.json({
    success: true,
    message: 'Authenticate' 
}));

router.get('/auth/student', auth, isStudent, (req, res) => res.json({
    success: true,
    message: 'Welcome Student' 
}));

router.get('/auth/instructor', auth, isInstructor, (req, res) => res.json({
    success: true, 
    message: 'Welcome Instructor'
}));

router.get('/auth/admin', auth, isAdmin, (req, res) => res.json({
    success: true,
    message: 'Welcome Admin' 
}));

module.exports = router;