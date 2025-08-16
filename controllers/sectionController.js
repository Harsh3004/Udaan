const sectionModel = require('../models/sectionModel');
const courseModel = require('../models/courseModel');
const subsectionModel = require('../models/subsectionModel');

exports.createSection = async (req,res) => {
    try{
        console.log(`Creating Section`);
        const {title} = req.body;
        const courseId = req.params.courseId;
        const userId = req.user.id;

        if(!title || !courseId || !userId){
            return res.status(404).json({
                success: false,
                message: `Missing Information`
            })
        }

        const course = await courseModel.findById(courseId);
        if(!course){
            return res.status(404).json({
                success: false,
                message: `Course not found`
            })
        }

        if(course.instructor.toString() !== userId){
            return res.status(403).json({
                success: false,
                message: `Unauthorized`
            })
        }

        const section = await sectionModel.create({
            title
        });

        await courseModel.findByIdAndUpdate(
            courseId,
            { $push: { section: section._id } },
            { new: true }
        );
        console.log(`Section created successfully`);
        
        return res.status(200).json({
            success: true,
            message: `Section created successfully`
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: `Error while creating section: ${error.message}`
        })
    }
}

exports.updateSection = async (req,res) => {
    try{
        console.log(`Updating section`);
        const {title} = req.body;
        const {courseId,sectionId} = req.params;
        const userId = req.user.id;

        if(!sectionId || !title || !userId || !courseId){
            return res.status(400).json({
                success: false,
                message: `Incomplete Information`
            })
        }

        const course = await courseModel.findById(courseId);
        if(!course){
            return res.status(404).json({
                success: false,
                message: `Course not found`
            })
        }

        if(course.instructor.toString() !== userId){
            return res.status(403).json({
                success: false,
                message: `Unauthorized`
            })
        }

        const updatedSection = await sectionModel.findByIdAndUpdate(sectionId,{
            title
        });

        if(!updatedSection){
            return res.status(404).json({
                success: false,
                message: `Section not found`
            })
        }
        
        console.log(`Section updated successfully`);

        return res.status(200).json({
            success: true,
            message: `Section updated successfully`
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: `Error while updating section: ${err.message}`
        })
    }
}

exports.deleteSection = async (req,res) => {
    try{
        const {courseId,sectionId} = req.params;
        const userId = req.user.id;

        if(!courseId || !sectionId || !userId){
            return res.status(400).json({
                success: false,
                message: `Incomplete Information`
            })
        }

        const course = await courseModel.findById(courseId);
        if(!course){
            return res.status(404).json({
                success: false,
                message: `Course not found`
            })
        }

        if(course.instructor.toString() !== userId){
            return res.status(403).json({
                success: false,
                message: `Unauthorized`
            })
        }

        const section = await sectionModel.findById(sectionId);
        if(!section){
            return res.status(404).json({
                success: false,
                message: `Section not found`
            })
        }

        await subsectionModel.deleteMany({ _id: { $in: section.subsection } });
        console.log(`Subsection deleted Successfully`);

        await courseModel.findByIdAndUpdate(
            courseId,
            {$pull: {section: sectionId}},
            {new: true}
        );
        console.log(`Remove section from course successfully`);
        
        await sectionModel.findByIdAndDelete(sectionId);
        console.log(`Section deleted Successfully`);

        return res.status(200).json({
            success: true,
            message: `Section deleted successfully`
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: `Error while deleting section: ${err.message}`
        })
    }
}

exports.showAllSection = async (req,res) => {
    try{
        console.log(`Fetching all Section details`);
        
        const courseId = req.params.courseId;

        if(!courseId){
            return res.status(400).json({
                success: false,
                message: `Course Id Not Found`
            })
        }

        const course = await courseModel.findById(courseId).populate("section").exec();
        if(!course){
            return res.status(404).json({
                success: false,
                message: `Course not found`
            })
        }

        const section = course?.section;
        console.log(`Fetched all sections details successfully`);

        return res.status(200).json({
            success:  true,
            message: `Fetched All sections`,
            section
        })
    }catch(err){
        res.status(400).json({
            success: false,
            message: `Error while fetching sections -- ${err.message}`
        })
    }
}