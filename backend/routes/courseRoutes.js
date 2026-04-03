const express = require('express');
const { auth, isInstructor, isStudent } = require('../middlewares/Auth');
const { createCourse, showAllCourses, deleteCourse, updateCourse , getCourseDetails, getInstructorCourses, getTopRatedCourses, getStudentEnrolledCourses} = require('../controllers/courseController');
const { createSection, updateSection, deleteSection, showAllSection } = require('../controllers/sectionController');
const { showAllsubsection, createsubSection, updatesubSection, deletesubSection } = require('../controllers/subsectionController');
const {addRatingReview,averageRating,showAllRatingAndReview} = require('../controllers/ratingAndReviewController');
const router = express.Router();

//Get courses
router.get('/getInstructorCourses',auth,isInstructor,getInstructorCourses);
router.get('/getEnrolledCourses',auth,isStudent,getStudentEnrolledCourses);
router.get('/top-rated', getTopRatedCourses);

// Course routes
router.get('/',showAllCourses);
router.get('/:courseId', getCourseDetails);
router.post('/create', auth, isInstructor, createCourse);
router.delete('/delete/:courseId', auth, isInstructor, deleteCourse);
router.put('/update/:courseId', auth, isInstructor, updateCourse);

// Section routes
router.get('/:courseId/section', showAllSection);
router.post('/:courseId/section/create', auth, isInstructor, createSection);
router.put('/:courseId/section/update/:sectionId', auth, isInstructor, updateSection);
router.delete('/:courseId/section/delete/:sectionId', auth, isInstructor, deleteSection);

// Subsection routes
router.get('/:courseId/section/:sectionId/subsection', showAllsubsection);
router.post('/:courseId/section/:sectionId/subsection/create', auth, isInstructor, createsubSection);
router.put('/:courseId/section/:sectionId/subsection/update/:subsectionId', auth, isInstructor, updatesubSection);
router.delete('/:courseId/section/:sectionId/subsection/delete/:subsectionId', auth, isInstructor, deletesubSection);

// Rating routes
router.get('/:courseId/rating',auth,showAllRatingAndReview);
router.post('/:courseId/rating/create',auth,addRatingReview);
router.get('/:courseId/rating/average',auth,averageRating);

module.exports = router;