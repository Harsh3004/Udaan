const cloudinary = require('cloudinary');
const { uploadToCloudinary, isFileSupported } = require('../utils/cloudinaryUploader');
const courseModel = require('../models/courseModel');
const userModel = require('../models/userModel');
const subsectionModel = require('../models/subsectionModel');
const sectionModel = require('../models/sectionModel');
const ratingAndReview = require('../models/ratingAndReviewModel');
const categoryModel = require('../models/categoryModel');
const { default: mongoose } = require('mongoose');
const sendMail = require('../utils/sendMail');
const courseProgressModel = require('../models/courseProgressModel');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

exports.createCourse = async (req, res) => {
    try {
        console.log(`Create Course API triggered...`);
        const { title, desc, language, price, whatyouwilllearn, category, instructions, tags } = req.body;
        const thumbnail = req.files.image;
        const user = req.user;

        const rawCategory = (typeof category === 'string') ? category.trim() : '';

        if (!title || !desc || !language || !price || !whatyouwilllearn || !thumbnail || !rawCategory) {
            console.log("Missing Details");
            return res.status(400).json({
                success: false,
                message: `Enter all details`
            })
        }

        console.log('Checking Category');
        let categoryDoc = null;
        if (mongoose.Types.ObjectId.isValid(rawCategory)) {
            categoryDoc = await categoryModel.findById(rawCategory);
        }

        if (!categoryDoc) {
            categoryDoc = await categoryModel.findOne({ name: { $regex: new RegExp(`^${rawCategory}$`, 'i') } });
        }

        if (!categoryDoc) {
            categoryDoc = await categoryModel.create({ name: rawCategory });
        }

        const categoryId = categoryDoc._id;

        console.log(`Checking for supported format`);
        const supportedTypes = ['jpeg', 'jpg', 'png'];
        const fileType = thumbnail.name.split('.')[1];
        if (!isFileSupported(fileType, supportedTypes)) {
            return res.status(400).json({
                success: false,
                message: `File type not supported`
            })
        }

        console.log(`Upload to cloudinary`);
        const response = await uploadToCloudinary(thumbnail, process.env.FOLDER_NAME);
        const course = await courseModel.create({
            title, desc,
            instructor: user.id,
            language: language,
            price: price,
            thumbnail: response,
            whatyouwilllearn: whatyouwilllearn ? JSON.parse(whatyouwilllearn) : [],
            category: categoryId,
            instructions: instructions ? JSON.parse(instructions) : [],
            tags: tags ? JSON.parse(tags) : [],
        });

        await categoryModel.findByIdAndUpdate(
            categoryId,
            { $addToSet: { courses: course._id } },
            { new: true }
        );

        // Fetch instructor details for email
        const instructorDetails = await userModel.findById(user.id);

        // Send mail
        try {
            const templatePath = path.join(__dirname, '../templates/course-created.html');
            let emailTemplate = fs.readFileSync(templatePath, 'utf8');
            
            emailTemplate = emailTemplate.replace('{{INSTRUCTOR_NAME}}', `${instructorDetails.fName} ${instructorDetails.lName}`);
            emailTemplate = emailTemplate.replace('{{COURSE_NAME}}', course.title);
            emailTemplate = emailTemplate.replace('{{DASHBOARD_LINK}}', 'http://localhost:5173/dashboard/my-courses');

            await sendMail(
                instructorDetails.email,
                'Udaan - Course Created Successfully',
                `Congratulations! Your course ${course.title} has been created as a draft.`,
                emailTemplate
            );
        } catch (mailError) {
            console.error(`Failed to send course creation email: ${mailError.message}`);
        }

        console.log('Course Created Successfully');
        return res.status(200).json({
            success: true,
            message: `Course created successfully`,
            course
        })
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({
            success: false,
            message: `Error in Creating Course: ${error.message}`
        })
    }
}

exports.deleteCourse = async (req, res) => {
    try {
        console.log(`Deleting course`);

        const courseId = req.params.courseId;
        const userId = req.user.id;

        if (!courseId || !userId) {
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

        if (!course) {
            return res.status(404).json({
                success: false,
                message: `Course not found`
            })
        }

        if (course.thumbnail?.public_id) {
            try {
                await cloudinary.uploader.destroy(course.thumbnail.public_id);
                console.log(`Thumbnail deleted successfully from cloudinary`);
            } catch (error) {
                console.log(`Error while deleting from cloudinary`);
                throw error
            }
        }

        let temp;
        for (const section of course.section) {
            if (section.subsection?.length)
                temp = await subsectionModel.deleteMany({ _id: { $in: section.subsection } });
        }
        console.log(`Sub-section deleted successfully: ${temp}`);

        temp = await sectionModel.deleteMany({ _id: { $in: course.section } });
        console.log(`Section deleted successfully: ${temp}`);

        temp = await userModel.findByIdAndUpdate(
            course.instructor,
            { $pull: { courses: courseId } },
            { new: true }
        );
        console.log(`Remove course from instructor course array: ${temp}`);

        await categoryModel.findByIdAndUpdate(course.category, { $pull: { courses: courseId } });
        await courseProgressModel.deleteMany({ courseID: courseId });

        temp = await courseModel.findByIdAndDelete(courseId);
        console.log(`Course deleted successfully: ${temp}`);

        // Send mail using template
        try {
            const templatePath = path.join(__dirname, '../templates/course-deleted.html');
            let emailTemplate = fs.readFileSync(templatePath, 'utf8');
            
            emailTemplate = emailTemplate.replace('{{INSTRUCTOR_NAME}}', `${course.instructor.fName} ${course.instructor.lName}`);
            emailTemplate = emailTemplate.replace('{{COURSE_NAME}}', course.title);

            await sendMail(
                course.instructor.email,
                'Udaan - Course Deletion',
                `Your course ${course.title} has been deleted successfully.`,
                emailTemplate
            );
        } catch (mailError) {
            console.error(`Failed to send course deletion email: ${mailError.message}`);
        }

        return res.status(201).json({
            success: true,
            message: `Course deleted successfully`
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error while deleting course: ${err.message}`
        })
    }
}

exports.updateCourse = async (req, res) => {
    try {
        console.log(`Updating course`);
        const updates = req.body;
        const courseId = req.params.courseId;
        const userId = req.user.id;

        if (!courseId || !userId || !updates) {
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }

        const courseDetails = await courseModel.findById(courseId);
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `Course not found`
            })
        }

        if (courseDetails.instructor.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: `Unauthorized`
            })
        }

        if (req.files && req.files.image) {
            console.log(`Updating thumbnail`);

            const thumbnail = req.files.image;

            const supportedTypes = ['jpeg', 'jpg', 'png'];
            const fileType = thumbnail.name.split('.')[1];
            if (!isFileSupported(fileType, supportedTypes)) {
                return res.status(400).json({
                    success: false,
                    message: `File type not supported`
                })
            }

            if (courseDetails.thumbnail && courseDetails.thumbnail.public_id) {
                await cloudinary.uploader.destroy(courseDetails.thumbnail.public_id);
            }

            const cloudResponse = await uploadToCloudinary(thumbnail, process.env.FOLDER_NAME);
            updates.thumbnail = cloudResponse;

            console.log(`Thumbnail updated successfully`);
        }

        if (updates.category) {
            const rawCategory = (typeof updates.category === 'string') ? updates.category.trim() : '';
            let categoryDoc = null;
            if (mongoose.Types.ObjectId.isValid(rawCategory)) {
                categoryDoc = await categoryModel.findById(rawCategory);
            }
            if (!categoryDoc) {
                categoryDoc = await categoryModel.findOne({ name: { $regex: new RegExp(`^${rawCategory}$`, 'i') } });
            }
            if (!categoryDoc) {
                categoryDoc = await categoryModel.create({ name: rawCategory });
            }

            const newCategoryId = categoryDoc._id;

            if (!courseDetails.category || courseDetails.category.toString() !== newCategoryId.toString()) {
                if (courseDetails.category) {
                    await categoryModel.findByIdAndUpdate(courseDetails.category, { $pull: { courses: courseId } });
                }
                await categoryModel.findByIdAndUpdate(newCategoryId, { $addToSet: { courses: courseId } });
            }
            
            updates.category = newCategoryId;
        }

        if (updates.instructions) {
            try {
                updates.instructions = JSON.parse(updates.instructions);
            } catch (e) {
                // Already an array or invalid JSON
            }
        }
        if (updates.whatyouwilllearn) {
            try {
                updates.whatyouwilllearn = JSON.parse(updates.whatyouwilllearn);
            } catch (e) {
                // Already an array or invalid JSON
            }
        }
        if (updates.tags) {
            try {
                updates.tags = JSON.parse(updates.tags);
            } catch (e) {
                // Already an array or invalid JSON
            }
        }

        console.log(`Updating course`)
        const updatedCourse = await courseModel.findByIdAndUpdate(courseId, updates, { new: true });

        console.log(`Course updated successfully`);
        return res.status(200).json({
            success: true,
            message: `Course updated successfully`
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error while updating course`
        })
    }
}

exports.showAllCourses = async (req, res) => {
    try {
        console.log(`Fetching all course details`);
        const courses = await courseModel.find({})
            .populate('category', 'name description')
            .populate('instructor', 'fName lName');

        console.log(`Fetched all course details successfully`);

        return res.status(200).json({
            success: true,
            message: `Fetched All Courses`,
            courses
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: `Error while fetching courses -- ${err.message}`
        })
    }
}

exports.getCourseDetails = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        if (!courseId) {
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
                populate: [
                    { path: 'additionalDetails' },
                    { path: 'courses' }
                ]
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

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `Course Not Exist`
            })
        }

        let completedVideos = [];
        if (req.user) {
            const courseProgressCount = await courseProgressModel.findOne({
                courseID: courseId,
                userId: req.user.id,
            });
            completedVideos = courseProgressCount ? courseProgressCount.completedVideos : [];
        }

        return res.status(200).json({
            success: true,
            message: `Fetch course details`,
            courseDetails,
            completedVideos
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error: ${error.message}`
        })
    }
}

exports.getRecommendedCourses = async (req, res) => {
    try {
        const { courseId } = req.params;
        const currentCourse = await courseModel.findById(courseId);
        
        if (!currentCourse) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const tags = Array.isArray(currentCourse.tags) ? currentCourse.tags : [];
        const category = currentCourse.category;
        
        // 1. Try fetching by tags first
        let recommendedCourses = await courseModel.find({
            _id: { $ne: courseId },
            tags: { $in: tags },
            status: "Published"
        })
        .limit(10)
        .populate("instructor")
        .populate("category")
        .populate("ratingAndReviews")
        .exec();

        // 2. If not enough results, fallback to category
        if (recommendedCourses.length < 4 && category) {
            const byCategory = await courseModel.find({
                _id: { $ne: courseId, $nin: recommendedCourses.map(c => c._id) },
                category: category,
                status: "Published"
            })
            .limit(10 - recommendedCourses.length)
            .populate("instructor")
            .populate("category")
            .populate("ratingAndReviews")
            .exec();
            
            recommendedCourses = [...recommendedCourses, ...byCategory];
        }

        // 3. Final Fallback: Just some latest published courses
        if (recommendedCourses.length < 1) {
            recommendedCourses = await courseModel.find({
                _id: { $ne: courseId },
                status: "Published"
            })
            .limit(10)
            .populate("instructor")
            .populate("category")
            .populate("ratingAndReviews")
            .sort({ createdAt: -1 })
            .exec();
        }

        return res.status(200).json({
            success: true,
            recommendedCourses: recommendedCourses || []
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error: ${error.message}`
        });
    }
}

exports.getStudentEnrolledCourses = async (req, res) => {
    try {
        console.log("Fetching course student enrolled in..");
        const userId = req.user.id;

        if (!userId) {
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
            success: true,
            message: "Enrolled Courses fetched",
            courses: coursesWithProgress
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while fetching Enrolled Courses: ${error}`
        })
    }
}

exports.getInstructorCourses = async (req, res) => {
    try {
        console.log("Fetching Instructor Courses");

        const userId = req.user.id;

        if (!userId) {
            return res.status(404).json({
                success: false,
                message: "Missing Instuctor"
            })
        }

        const courses = await courseModel.find({ instructor: userId }).populate('category', 'name');
        return res.status(200).json({
            success: true,
            message: `Fetched Instructor Courses`,
            courses
        })
    } catch (error) {
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

exports.updateCourseProgress = async (req, res) => {
    try {
        const { courseId, subsectionId } = req.body;
        const userId = req.user.id;

        if (!courseId || !subsectionId) {
            return res.status(400).json({
                success: false,
                message: "Missing course or subsection information"
            });
        }

        let progress = await courseProgressModel.findOne({
            courseID: courseId,
            userId: userId
        });

        if (!progress) {
            progress = await courseProgressModel.create({
                courseID: courseId,
                userId: userId,
                completedVideos: [subsectionId]
            });
        } else {
            if (!progress.completedVideos.includes(subsectionId)) {
                progress.completedVideos.push(subsectionId);
                await progress.save();
            }
        }

        return res.status(200).json({
            success: true,
            message: "Progress updated successfully"
        });
    } catch (error) {
        console.error("Error in updateCourseProgress:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}