const cloudinary = require('cloudinary');
const {uploadToCloudinary,isFileSupported} = require('../utils/cloudinaryUploader');
const courseModel = require('../models/courseModel');
const userModel = require('../models/userModel');
const subsectionModel = require('../models/subsectionModel');
const sectionModel = require('../models/sectionModel');
const sendMail = require('../utils/sendMail');
const ratingAndReview = require('../models/ratingAndReviewModel');
require('dotenv').config();

exports.createCourse = async(req,res) => {
    try{
        const {title,desc,language,price,whatyouwilllearn} = req.body;
        const thumbnail = req.files.image;
        const userDetails = req.user;
        
        if(!title || !desc || !language || !price || !whatyouwilllearn || !thumbnail){
            return res.status(400).json({
                success: false,
                message: `Enter all details`
            })
        }
        
        const supportedTypes = ['jpeg','jpg','png'];
        const fileType = thumbnail.name.split('.')[1];
        if(!isFileSupported(fileType,supportedTypes)){
            return res.status(400).json({
                success: false,
                message: `File type not supported`
            })
        }
        
        const response = await uploadToCloudinary(thumbnail,process.env.FOLDER_NAME);

        const course = await courseModel.create({
            title,desc,
            instructor: userDetails.id,
            language: language,
            price: price,
            thumbnail: response,
            whatyouwilllearn: whatyouwilllearn
        });

        // Post middleware:
        // --> push course in instructor course array
        // --> Send mail
        
        return res.status(200).json({
            success: true,
            message: `Course created successfully`,
            course
        })
    }catch(error){
        return res.status(400).json({
            success: false,
            message: `Error in Creating Course: ${error.message}`
        })
    }
}

exports.deleteCourse = async (req,res) => {
    try{
        console.log(`Deleting course`);
        
        const courseId = req.params.courseId;
        const userId = req.user.id;

        if(!courseId || !userId){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }
 
        const course = await courseModel.findById(courseId)
        .populate('instructor')
        .populate({
            path: "section",
            populate: {
                path: "subsection"
            }
        });
    
        if(!course){
            return res.status(404).json({
                success: false,
                message: `Course not found`
            })
        }

        if(course.thumbnail?.public_id){
            try{
                await cloudinary.uploader.destroy(course.thumbnail.public_id);
                console.log(`Thumbnail deleted successfully from cloudinary`);
            }catch(error){
                console.log(`Error while deleting from cloudinary`);
                throw error
            }
        }

        let temp;
        for(const section of course.section){
            if(section.subsection?.length)
                temp = await subsectionModel.deleteMany({ _id: { $in: section.subsection } });
        }
        console.log(`Sub-section deleted successfully: ${temp}`);
        
        temp = await sectionModel.deleteMany({ _id: { $in: course.section } });
        console.log(`Section deleted successfully: ${temp}`);
        
        temp = await userModel.findByIdAndUpdate(
            course.instructor,
            { $pull: {courses: courseId} },
            { new: true }
        );
        console.log(`Remove course from instructor course array: ${temp}`);
        
        temp = await courseModel.findByIdAndDelete(courseId);
        console.log(`Course deleted successfully: ${temp}`);

        sendMail(
            course.instructor.email,
            'Course Deletion',
            'Course Deleted Successfully..'
        )

        return res.status(201).json({
            success: true,
            message: `Course deleted successfully`
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: `Error while deleting course: ${err.message}`
        })
    }
}

exports.updateCourse = async (req,res) => {
    try{
        console.log(`Updating course`);
        const updates = req.body;
        const courseId = req.params.courseId;
        const userId = req.user.id;
        
        if(!courseId || !userId || !updates){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }
        
        const courseDetails = await courseModel.findById(courseId);
        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: `Course not found`
            })
        }
        
        if(courseDetails.instructor.toString() !== userId){
            return res.status(403).json({
                success: false,
                message: `Unauthorized`
            })
        }
        
        if(req.files && req.files.image){
            console.log(`Updating thumbnail`);
            
            const thumbnail = req.files.image;
            
            const supportedTypes = ['jpeg','jpg','png'];
            const fileType = thumbnail.name.split('.')[1];
            if(!isFileSupported(fileType,supportedTypes)){
                return res.status(400).json({
                    success: false,
                    message: `File type not supported`
                })
            }

            const cloudResponse = await uploadToCloudinary(thumbnail,"Udaan");
            updates.thumbnail = cloudResponse;

            console.log(`Thumbnail updated successfully`);
        }
        
        const updatedCourse = await courseModel.findByIdAndUpdate(courseId,updates,{new: true});
        
        console.log(`Course updated successfully`);
        return res.status(200).json({
            success: true,
            message: `Course updated successfully`
        })        
    }catch(err){
        return res.status(500).json({
            success: false,
            message: `Error while updating course`
        })
    }
}

exports.showAllCourses = async (req,res) => {
    try{
        console.log(`Fetching all course details`);
        const courses = await courseModel.find({});

        console.log(`Fetched all course details successfully`);

        return res.status(200).json({
            success:  true,
            message: `Fetched All Courses`,
            courses
        })
    }catch(err){
        res.status(400).json({
            success: false,
            message: `Error while fetching courses -- ${err.message}`
        })
    }
}

exports.getCourseDetails = async (req,res) => {
    try{
        const courseId = req.params.courseId;
        if(!courseId){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }

        const courseDetails = await courseModel.findById(courseId)
        .populate({
            path: 'studentEnrolled',
            populate: {
                path: "additionalDetails"
            }
        })
        .populate({
            path: 'instructor',
            populate: {
                path: 'additionalDetails',
                path: 'courses'
            }
        })
        .populate({
            path: 'section',
            populate: {
                path: 'subsection'
            }
        })
        .populate({
            path: 'ratingAndReviews',
            populate: {
                path: 'user'
            }
        })
        .exec();

        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: `Course Not Exist`
            })
        }

        return res.status(200).json({
            success: true,
            message: `Fetch course details`,
            courseDetails
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: `Error: ${error.message}`
        })
    }
}