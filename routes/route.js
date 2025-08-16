const user = require('../models/userModel.js');
const {auth,isStudent,isAdmin,isInstructor} = require('../middlewares/Auth.js');
const {sendOtp,signUp,login,changePassword} = require('../controllers/authController.js');
const {createCourse,showAllCourses,deleteCourse,updateCourse} = require('../controllers/courseController.js');
const { createSection, updateSection, deleteSection, showAllSection } = require('../controllers/sectionController.js');

const express = require('express');
const router = express.Router();

//auth
router.post('/sendOtp', sendOtp);
router.get('/signUp', signUp);
router.get('/login', login);
router.put('/changePassword', changePassword);

//course
router.get('/course',auth,isInstructor,showAllCourses);
router.post('/course/create',auth,isInstructor,createCourse);
router.delete('/course/delete/:courseId',auth,isInstructor,deleteCourse);
router.put('/course/update/:courseId',auth,isInstructor,updateCourse);

//section
router.get('/course/:courseId/section',auth,isInstructor,showAllSection);
router.post('/course/:courseId/create',auth,isInstructor,createSection);
router.put('/course/:courseId/update/:sectionId',auth,isInstructor,updateSection);
router.delete('/course/:courseId/delete/:sectionId',auth,isInstructor,deleteSection);

router.get('/auth', auth, async(req,res)=>{
    res.json({
        success: true,
        message: `Authenticate`
    })
})

router.get('/auth/student', auth, isStudent, async(req,res)=>{
    res.json({
        success: true,
        message: `Welcome Student`
    })
})

router.get('/auth/instructor', auth, isInstructor, async(req,res)=>{
    res.json({
        success: true,
        message: `Welcome Instructor`
    })
})

router.get('/auth/admin', auth, isAdmin, async(req,res)=>{
    res.json({
        success: true,
        message: `Welcome Admin`
    })
})

module.exports = router;