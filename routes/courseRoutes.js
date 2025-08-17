const express = require('express');
const { auth, isInstructor } = require('../middlewares/Auth');
const { createCourse, showAllCourses, deleteCourse, updateCourse } = require('../controllers/courseController');
const { createSection, updateSection, deleteSection, showAllSection } = require('../controllers/sectionController');
const { showAllsubsection, createsubSection, updatesubSection, deletesubSection } = require('../controllers/subsectionController');
const router = express.Router();

// Course routes
router.get('/', auth, isInstructor, showAllCourses);
router.post('/create', auth, isInstructor, createCourse);
router.delete('/delete/:courseId', auth, isInstructor, deleteCourse);
router.put('/update/:courseId', auth, isInstructor, updateCourse);

// Section routes
router.get('/:courseId/section', auth, isInstructor, showAllSection);
router.post('/:courseId/section/create', auth, isInstructor, createSection);
router.put('/:courseId/section/update/:sectionId', auth, isInstructor, updateSection);
router.delete('/:courseId/section/delete/:sectionId', auth, isInstructor, deleteSection);

// Subsection routes
router.get('/:courseId/section/:sectionId/subsection', auth, isInstructor, showAllsubsection);
router.post('/:courseId/section/:sectionId/subsection/create', auth, isInstructor, createsubSection);
router.put('/:courseId/section/:sectionId/subsection/update/:subsectionId', auth, isInstructor, updatesubSection);
router.delete('/:courseId/section/:sectionId/subsection/delete/:subsectionId', auth, isInstructor, deletesubSection);

module.exports = router;