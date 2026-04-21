const razorpay = require('razorpay');
const {razorpayInstance} = require('../config/razorpay');
const courseModel = require('../models/courseModel');
const userModel = require('../models/userModel');
const { default: mongoose } = require('mongoose');
const crypto = require("crypto");
const fs = require('fs');
const path = require('path');
const sendMail = require('../utils/sendMail');

const sendEnrollmentMail = async (course,user) => {
    // Send Enrollment Email
    try {
        const templatePath = path.join(__dirname, '../templates/course-enrollment.html');
        let emailTemplate = fs.readFileSync(templatePath, 'utf8');
        
        emailTemplate = emailTemplate.replace('{{STUDENT_NAME}}', user.fName);
        emailTemplate = emailTemplate.replace('{{COURSE_NAME}}', course.title);
        emailTemplate = emailTemplate.replace('{{COURSE_LINK}}', `${process.env.CLIENT_URL_PROD}/dashboard/enrolled-courses`)

        await sendMail(
            user.email,
            `Successfully Enrolled in ${course.title}`,
            `Congratulations! You have successfully enrolled in ${course.title}.`,
            emailTemplate
        );

        console.log(`Enrollment email sent to ${user.email}`);
    } catch (mailError) {
        console.log(`Failed to send enrollment email: ${mailError.message}`);
    }
}

exports.capturePayment = async (req,res) => {
    console.log("Create Order API Triggered...");
    try{
        const userId = req.user.id;
        const courseId = req.body.courseId;

        if(!userId || !courseId){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }

        console.log(`Fetching Course Details`);

        const courseDetails = await courseModel.findById(courseId);
        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: `Course Not Found`
            })
        }

        console.log(`Checking for valid student`);

        const uid = new mongoose.Types.ObjectId(userId);
        if(courseDetails.studentEnrolled.includes(uid)){
            return res.status(200).json({
                success: false,
                message: "Student is Already Enrolled"
            })
        }

        console.log(`Creating Options`);

        const options = {
            amount: courseDetails.price * 100, // In paise
            currency: "INR",
            receipt: "receipt_" + Math.random(Date.now()).toString(),
            notes: {
                userId: userId,
                courseId: courseId
            }
        }

        console.log(`Creating Order`);

        try{
            const order = await razorpayInstance.orders.create(options);
            return res.json({
                success: true,
                courseDetails,
                order
            })
        }catch(error){
            return res.status(500).json({
                success: false,
                message: `Error in order creation: ${error.message}`
            })
        }
    }catch(error){
        return res.status(500).json({
            success: false,
            message: `Error: ${error.message}`
        })
    }
}

exports.verifyPayment = async (req,res) => {
    try{
        console.log(`Verifying Payment`);
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;
        const order = await razorpayInstance.orders.fetch(razorpay_order_id);
        const { userId, courseId } = order.notes;
        if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body)
        .digest("hex");

        if (expectedSignature === razorpay_signature){
            console.log("Signature Verified");
            const updatedUser = await userModel.findByIdAndUpdate(userId,
                {$push: {courses: courseId}},
                {new: true}
            );

            if(!updatedUser){
                return res.status(404).json({
                    success: false,
                    message: "User Not Found"
                });
            }

            const updatedCourse = await courseModel.findByIdAndUpdate(courseId,
                {$push: {studentEnrolled: userId}},
                {new: true}
            );

            if(!updatedCourse){
                return res.status(404).json({
                    success: false,
                    message: "Course Not Found"
                });
            }

            sendEnrollmentMail(updatedCourse,updatedUser);

            return res.status(200).json({
                success: true,
                message: "Course Buyed Successfully"
            });
        }
        else{
            res.status(400).json({
                success: false ,
                message: "Payment Failed"
            });
        }
    }catch(err){
        console.log(`Webhook verification failed`)
        return res.status(400).send(`Internal Error: ${err.message}`);
    }
}