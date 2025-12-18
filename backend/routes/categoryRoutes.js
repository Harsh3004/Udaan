const express = require('express');
const { auth, isInstructor, isAdmin } = require('../middlewares/Auth');
const { createCategory, getAllCategories, getCategoryCourses } = require('../controllers/categoryController');
const router = express.Router();

const allowInstructorOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'Instructor' || req.user.role === 'Admin')) {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Only instructors or admins can perform this action'
    });
};

router.post('/create', auth, allowInstructorOrAdmin, createCategory);
router.get('/', getAllCategories);
router.get('/:categoryId/courses', getCategoryCourses);

module.exports = router;
