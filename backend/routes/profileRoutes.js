const express = require('express');
const { auth } = require('../middlewares/Auth');
const { showProfileDetails, updateProfile } = require('../controllers/profileController');
const router = express.Router();

// Profile routes
router.get('/', auth, showProfileDetails);
router.put('/update', auth, updateProfile);

module.exports = router;