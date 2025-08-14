const user = require('../models/userModel.js');
const {auth,isStudent,isAdmin,isInstructor} = require('../middlewares/Auth.js');
const {sendOtp,signUp,login,changePassword} = require('../controllers/authController.js');
const {createCourse} = require('../controllers/courseController.js');

const express = require('express');
const router = express.Router();


router.get('/users', async(req,res)=>{
    try{
        const users = await user.create({
            name: 'Harsh',
            age: 20
            // email: "harshjoshi3004@gmail.com"
        });
        res.status(200).json(users)
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
})

router.post('/sendOtp', sendOtp);
router.get('/signUp', signUp);
router.get('/login', login);
router.put('/changePassword', changePassword);

router.post('/course/create',auth,isInstructor,createCourse);

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