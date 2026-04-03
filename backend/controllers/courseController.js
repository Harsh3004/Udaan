const cloudinary = require('cloudinary');
const {uploadToCloudinary,isFileSupported} = require('../utils/cloudinaryUploader');
const courseModel = require('../models/courseModel');
const userModel = require('../models/userModel');
const subsectionModel = require('../models/subsectionModel');
const sectionModel = require('../models/sectionModel');
const ratingAndReview = require('../models/ratingAndReviewModel');
const categoryModel = require('../models/categoryModel');
const { default: mongoose } = require('mongoose');
const sendMail = require('../utils/sendMail');
const courseProgressModel = require('../models/courseProgressModel');

require('dotenv').config();

exports.createCourse = async(req,res) => {
    try{
        console.log(`Create Course API triggered...`);
        const {title,desc,language,price,whatyouwilllearn, category} = req.body;
        const thumbnail = req.files.image;
        const user = req.user;

        const rawCategory = (typeof category === 'string') ? category.trim() : '';

        if(!title || !desc || !language || !price || !whatyouwilllearn || !thumbnail || !rawCategory){
            console.log("Missing Details");
            return res.status(400).json({
                success: false,
                message: `Enter all details`
            })
        }

        // Allow either an existing category id or a new category name; create on-the-fly if needed
        let categoryDoc = null;
        if(mongoose.Types.ObjectId.isValid(rawCategory)){
            categoryDoc = await categoryModel.findById(rawCategory);
        }

        if(!categoryDoc){
            categoryDoc = await categoryModel.findOne({ name: { $regex: new RegExp(`^${rawCategory}$`, 'i') } });
        }

        if(!categoryDoc){
            categoryDoc = await categoryModel.create({ name: rawCategory });
        }

        const categoryId = categoryDoc._id;

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
            instructor: user.id,
            language: language,
            price: price,
            thumbnail: response,
            whatyouwilllearn: whatyouwilllearn,
            category: categoryId
        });

        await categoryModel.findByIdAndUpdate(
            categoryId,
            { $addToSet: { courses: course._id } },
            { new: true }
        );

        // Post middleware:
        // --> push course in instructor course array
        // --> Send mail
        
        return res.status(200).json({
            success: true,
            message: `Course created successfully`,
            course
        })
    }catch(error){
        console.log(error.message);
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
        
        await categoryModel.findByIdAndUpdate(course.category, { $pull: { courses: courseId } });

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

        if(updates.category){
            const newCategory = await categoryModel.findById(updates.category);
            if(!newCategory){
                return res.status(404).json({
                    success: false,
                    message: `Category not found`
                })
            }

            if(courseDetails.category && courseDetails.category.toString() !== updates.category){
                await categoryModel.findByIdAndUpdate(courseDetails.category, { $pull: { courses: courseId } });
                await categoryModel.findByIdAndUpdate(updates.category, { $addToSet: { courses: courseId } });
            }
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
        const courses = await courseModel.find({}).populate('category','name description');

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
        .populate('category')
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

exports.getStudentEnrolledCourses = async (req,res) => {
    try{
        console.log("Fetching course student enrolled in..");
        const userId = req.user.id;

        if(!userId){
            return res.status(404).json({
                success: false,
                message: "Missing Information"
            })
        }

        const userDetails = await userModel.findById(userId).populate({
            path: 'courses',
            populate: {
                path: 'section',
                populate: {
                    path: 'subsection'
                }
            }
        });

        if (!userDetails)
            return res.status(404).json({ success: false, message: "User not found" });

        const courseProgressRecords = await courseProgressModel.find({ userId: userId });

        const coursesWithProgress = userDetails.courses.map((course) => {
            // Counting total videos in course
            let totalVideos = 0;
            if (course.section) {
                course.section.forEach(sec => {
                    totalVideos += sec.subSection ? sec.subSection.length : 0;
                });
            }

            // progress record for course
            const progressRecord = courseProgressRecords.find(
                (record) => record.courseID.toString() === course._id.toString()
            );

            // Counting completed videos
            const completedVideosCount = progressRecord ? progressRecord.completedVideos.length : 0;

            // Calculating percentage
            let progressPercentage = 0;
            if (totalVideos !== 0) {
                progressPercentage = Math.round((completedVideosCount / totalVideos) * 100);
            }

            const status = progressPercentage === 100 ? "Completed" : "In Progress";

            return {
                ...course.toObject(),
                progressPercentage,
                status,
                // totalDuration: "..." // sum up subSection video durations
            };
        });
        
        return res.status(200).json({
            success : true,
            message: "Enrolled Courses fetched",
            courses: coursesWithProgress
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: `Error while fetching Enrolled Courses: ${error}`
        })
    }
}

exports.getInstructorCourses = async (req,res) => {
    try{
        console.log("Fetching Instructor Courses");

        const userId = req.user.id;

        if(!userId){
            return res.status(404).json({
                success: false,
                message: "Missing Instuctor"
            })
        }

        const courses = await courseModel.find({instructor: userId}).populate('category','name');
        return res.status(200).json({
            success: true,
            message: `Fetched Instructor Courses`,
            courses
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'Error while fetching instructor courses'
        })
    }
}

// Top rated published courses (for homepage)
exports.getTopRatedCourses = async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 6, 20);

        const topCourses = await ratingAndReview.aggregate([
            {
                $group: {
                    _id: "$course",
                    avgRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            },
            { $sort: { avgRating: -1, totalReviews: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "courses",
                    localField: "_id",
                    foreignField: "_id",
                    as: "course"
                }
            },
            { $unwind: "$course" },
            { $match: { "course.status": "Published" } },
            {
                $lookup: {
                    from: "categories",
                    localField: "course.category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: "$course._id",
                    title: "$course.title",
                    desc: "$course.desc",
                    language: "$course.language",
                    price: "$course.price",
                    thumbnail: "$course.thumbnail",
                    status: "$course.status",
                    category: {
                        _id: "$category._id",
                        name: "$category.name"
                    },
                    avgRating: { $round: ["$avgRating", 2] },
                    totalReviews: 1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            courses: topCourses
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while fetching top rated courses: ${error.message}`
        });
    }
}