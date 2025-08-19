const {razorpayInstance} = require('../config/razorpay');
const courseModel = require('../models/courseModel');
const userModel = require('../models/userModel');

exports.capturePayment = async (req,res) => {
    try{
        const userId = req.user.id;
        const courseId = req.params.id;

        if(!userId || !courseId){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }

        const courseDetails = await courseModel.findById(courseId);
        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: `Course Not Found`
            })
        }

        const options = {
            amount: courseDetails.price * 100,
            currency: "INR",
            receipt: Math.random(Date.now()).toString(),
            notes: {
                userId: userId,
                courseId: courseId
            }
        }

        try{
            const order = await razorpayInstance.orders.create(options);
            return res.status(200).json({
                success: true,
                courseDetails,
                orderId: order.id
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
        const {userId,courseId} = req.body.payload.payment.entity.notes;
        if(!userId,!courseId){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }

        const shasum = crypto.createHmac('sha256',process.env.RAZORPAY_SECRET);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if(digest === req.headers['x-razorpay-signature']){
            console.log(`Webhook Verification successful`);

            try{
                const updatedUser = await userModel.findByIdAndUpdate(
                    userId,
                    { $push: { courses: courseId }},
                    {new: true}
                )

                if(!updatedUser)
                    return res.status(404).send(`User Not Found`);
                
                const updatedCourse = await courseModel.findByIdAndUpdate(
                    courseId,
                    {$push: {studentEnrolled: userId}},
                    { new: true }
                );

                if(!updatedCourse)
                    return res.status(404).send(`Course Not Found`);

            }catch(error){
                return res.status(500).send(`Error while making entries in database`);
            }
            
            return res.status(200).send('Course Buyed successfully');
        }else{
            console.log(`Webhook verification failed`)
            return res.status(400).send('Invalid Signature');
        }
    }catch(err){
        console.log(`Webhook verification failed`)
        return res.status(400).send(`Internal Error: ${err.message}`);
    }
}