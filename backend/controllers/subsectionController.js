const courseModel = require('../models/courseModel');
const sectionModel = require('../models/sectionModel');
const subsectionModel = require('../models/subsectionModel');
const {uploadToCloudinary, isFileSupported} = require('../utils/cloudinaryUploader');
require('dotenv').config();

exports.createsubSection = async (req,res) => {
    try{
        console.log('Creating Subsection')
        const {topic,description,timeDuration,sectionId} = req.body;
        const file = req?.files?.lectureVideo;
        const userId = req.user.id;

        if(!topic || !description || !file){
            return res.status(404).json({
                success: false,
                message: `Enter all details`
            })
        }

        console.log('Checking file Type')
        const supportedType = ["mp4", "mov", "avi", "mkv"];
        const fileName = file.name.split('.');
        if(!isFileSupported(fileName[fileName.length-1],supportedType)){
            return res.status(400).json({
                success: false,
                message: `File type not supported`
            })
        }
        
        console.log("Uploading to cloudinary"); 
        const cloudResponse = await uploadToCloudinary(file,process.env.FOLDER_NAME);

        console.log(cloudResponse);

        // Calculate duration in MM:SS format
        const totalSeconds = Math.round(cloudResponse.duration);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        console.log('Creating subsection')

        const subsection = await subsectionModel.create({
            topic: topic,
            description: description,
            timeDuration: formattedDuration,
            file: cloudResponse
        });

        console.log('subsection uploaded successfully')

        await sectionModel.findByIdAndUpdate(
            sectionId,
            { $push: { subsection: subsection._id } },
            { new: true }
        );

        console.log("Adding subsection id in section")

        // Trigger AI Review update
        const aiController = require('./aiController');
        // Find courseId from sectionId
        courseModel.findOne({ section: sectionId }).then(course => {
            if (course) {
                aiController.generateCourseReview({ courseId: course._id })
                    .catch((err) => console.error(`AI Review update failed for course ${course._id}:`, err));
            }
        });

        return res.status(200).json({
            success: true,
            message: `Sub-section created successfully`,
            subsection
        })
    }catch(error){
        return res.status(400).json({
            success: false,
            message: `Error while creating sub-section: ${error.message}`,
            error
        })
    }
}

exports.updatesubSection = async (req,res) => {
    try{
        console.log(`Updating sub-section`);
        const updates = req.body;
        const {courseId,sectionId,subsectionId} = req.params;
        const userId = req.user.id;
        
        if(!courseId || !userId || !updates){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }
        
        // const courseDetails = await courseModel.findById(courseId);
        // if(!courseDetails){
        //     return res.status(404).json({
        //         success: false,
        //         message: `Course not found`
        //     })
        // }
        
        // if(courseDetails.instructor.toString() !== userId){
        //     return res.status(403).json({
        //         success: false,
        //         message: `Unauthorized`
        //     })
        // }

        // const section = await sectionModel.findById(sectionId);
        // if(!section){
        //     return res.status(404).json({
        //         success: false,
        //         message: `Section Not Found`
        //     })
        // }

        // const subsection = await subsectionModel.findById(subsectionId);
        // if(!subsection){
        //     return res.status(404).json({
        //         success: false,
        //         message: `Subsection Not Found`
        //     })
        // }
        
        if(req.files && req.files.lectureVideo){
            const toupdatefile = req.files.lectureVideo;
            const cloudResponse = await uploadToCloudinary(toupdatefile,process.env.FOLDER_NAME);
            updates.file = cloudResponse;
            
            // Update duration if new video is uploaded
            const totalSeconds = Math.round(cloudResponse.duration);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            updates.timeDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
        
        const updatedsubsection = await subsectionModel.findByIdAndUpdate(subsectionId,
            updates,
            {new: true}
        );
        
        console.log(`Subsection updated successfully`);

        // Trigger AI Review update
        const aiController = require('./aiController');
        aiController.generateCourseReview({ courseId: courseId })
            .catch((err) => console.error(`AI Review update failed for course ${courseId}:`, err));

        return res.status(200).json({
            success: true,
            message: `subsection updated successfully`
        })        
    }catch(err){
        return res.status(500).json({
            success: false,
            message: `Error while updating subsection`
        })
    }
}

exports.deletesubSection = async (req,res) => {
    try{
        const {courseId,sectionId,subsectionId} = req.params;
        const userId = req.user.id;

        if(!courseId || !sectionId || !subsectionId || !userId){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }

        // const courseDetails = await courseModel.findById(courseId);
        // if(!courseDetails){
        //     return res.status.json({
        //         success: false,
        //         message: `Course Not Found`
        //     })
        // }

        // if(courseDetails.instructor.toString()!==userId){
        //     return res.status(403).json({
        //         success: false,
        //         message: `Unauthorized`
        //     })
        // }

        const subsectionDetails = await subsectionModel.findById(subsectionId);
        if(!subsectionDetails){
            return res.status(404).json({
                success: false,
                message: `Subsection Not Found`
            })
        }

        if(subsectionDetails.file?.public_id){
            try{
                await clodinary.uploader.destroy(subsectionDetails.file.public_id);
                console.log(`Resources were removed from cloudinary`);
            }catch(error){
                throw new Error(`Error while deleting file from cloudinary: ${error.message}`)
            }
        }

        const sectionDetails = await sectionModel.findByIdAndUpdate(
            sectionId,
            {$pull: {subsection: subsectionId}},
            {new: true}
        );

        await subsectionModel.findByIdAndDelete(subsectionId);

        if(!sectionDetails){
            return res.status(404).json({
                success: false,
                message: `Section Not Found`
            })
        }

        // Trigger AI Review update
        const aiController = require('./aiController');
        aiController.generateCourseReview({ courseId: courseId })
            .catch((err) => console.error(`AI Review update failed for course ${courseId}:`, err));

        return res.status(200).json({
            success: true,
            message: `Subsection Removed successfully`
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: `Error while removing subsection: ${err.message}`
        })
    }
}

exports.showAllsubsection = async (req,res) => {
    try{
        const {sectionId} = req.params;
        
        if(!sectionId){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }

        const subsection = await subsectionModel.find({});
        return res.status(200).json({
            success: true,
            message:`Subsection fetched successfully`,
            subsection
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }
}