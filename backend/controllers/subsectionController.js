const courseModel = require('../models/courseModel');
const sectionModel = require('../models/sectionModel');
const subsectionModel = require('../models/subsectionModel');
const {uploadToCloudinary, isFileSupported} = require('../utils/cloudinaryUploader');
require('dotenv').config();

exports.createsubSection = async (req,res) => {
    try{
        const {topic,description,timeDuration} = req.body;
        console.log(req.files);
        const file = req.files.file;
        const {courseId,sectionId} = req.params;
        const userId = req.user.id;

        if(!topic || !description || !file){
            return res.status(404).json({
                success: false,
                message: `Enter all details`
            })
        }

        // Check wheater this additional validation required or not 

        // const course = await courseModel.findById(courseId);
        // if(!course){
        //     return res.status(404).json({
        //         success: false,
        //         message: `Course Not found`
        //     })
        // }

        // if(course.instructor.toString() !== userId){
        //     return res.status(403).json({
        //         success: false,
        //         message: `Unauthorized`
        //     })
        // }

        // const section = await sectionModel.findById(sectionId);
        // if(!section){
        //     return res.status(400).json({
        //         success: false,
        //         message: `section not found`
        //     })
        // }

        const supportedType = ["mp4", "mov", "avi", "mkv"];
        if(!isFileSupported(file.name.split('.')[1],supportedType)){
            return res.status(400).json({
                success: false,
                message: `File type not supported`
            })
        }
        
        const cloudResponse = await uploadToCloudinary(file,process.env.FOLDER_NAME);

        console.log(cloudResponse);

        const subsection = await subsectionModel.create({
            topic: topic,
            description: description,
            file: cloudResponse
        });

        await sectionModel.findByIdAndUpdate(
            sectionId,
            { $push: { subsection: subsection._id } },
            { new: true }
        );

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
        
        if(req.files && req.files.file){
            const toupdatefile = req.files.file;
            const cloudResponse = await uploadToCloudinary(toupdatefile,process.env.FOLDER_NAME);
            updates.file = cloudResponse;
        }
        
        const updatedsubsection = await sectionModel.findByIdAndUpdate(subsectionId,
            updates,
            {new: true}
        );
        
        console.log(`Subsection updated successfully`);
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