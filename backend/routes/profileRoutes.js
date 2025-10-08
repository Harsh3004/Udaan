const express = require('express');
const { auth } = require('../middlewares/Auth');
const { showProfileDetails, updateProfile } = require('../controllers/profileController');
const router = express.Router();

// Profile routes
router.get('/', showProfileDetails);
router.put('/update', updateProfile);

module.exports = router;