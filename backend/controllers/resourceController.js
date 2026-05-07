const resourceModel = require('../models/courseResourceModel');
const courseModel = require('../models/courseModel');
const { uploadToCloudinary } = require('../utils/cloudinaryUploader');
const cloudinary = require('cloudinary').v2;

exports.uploadResource = async (req, res) => {
    try {
        const { courseId } = req.body;
        const instructorId = req.user.id;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID is required'
            });
        }

        if (!req.files || !req.files.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const file = req.files.file;

        const supportedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/gif',
            'video/mp4',
            'video/webm',
            'audio/mpeg',
            'audio/wav',
            'application/zip',
            'application/x-rar-compressed'
        ];

        const fileType = file.mimetype;
        if (!supportedTypes.includes(fileType)) {
            return res.status(400).json({
                success: false,
                message: 'File type not supported'
            });
        }

        const maxSize = 500 * 1024 * 1024;
        if (file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: 'File size too large (max 500MB)'
            });
        }

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (course.instructor.toString() !== instructorId) {
            return res.status(403).json({
                success: false,
                message: 'Only the course instructor can upload resources'
            });
        }

        const { title, description } = req.body;
        if (!title || title.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Resource title is required'
            });
        }

        const result = await uploadToCloudinary(file, 'course_resources');

        const resource = await resourceModel.create({
            course: courseId,
            instructor: instructorId,
            title: title.trim(),
            description: description ? description.trim() : '',
            file: {
                url: result.url,
                public_id: result.public_id
            },
            fileName: file.name,
            fileSize: file.size,
            fileType: fileType
        });

        return res.status(201).json({
            success: true,
            message: 'Resource uploaded successfully',
            resource
        });

    } catch (error) {
        console.error('Error uploading resource:', error);
        return res.status(500).json({
            success: false,
            message: `Error uploading resource: ${error.message}`
        });
    }
};

exports.getCourseResources = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID is required'
            });
        }

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const isEnrolled = course.studentEnrolled.includes(userId);
        const isInstructor = course.instructor.toString() === userId;

        if (!isEnrolled && !isInstructor) {
            return res.status(403).json({
                success: false,
                message: 'Only enrolled students and course instructor can access resources'
            });
        }

        const resources = await resourceModel.find({ course: courseId })
            .populate('instructor', 'fName lName')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            resources
        });

    } catch (error) {
        console.error('Error fetching resources:', error);
        return res.status(500).json({
            success: false,
            message: `Error fetching resources: ${error.message}`
        });
    }
};

exports.deleteResource = async (req, res) => {
    try {
        const { resourceId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!resourceId) {
            return res.status(400).json({
                success: false,
                message: 'Resource ID is required'
            });
        }

        const resource = await resourceModel.findById(resourceId);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        if (resource.instructor.toString() !== userId && userRole !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'Only the resource uploader or admin can delete this resource'
            });
        }

        if (resource.file && resource.file.public_id) {
            await cloudinary.uploader.destroy(resource.file.public_id);
        }

        await resourceModel.findByIdAndDelete(resourceId);

        return res.status(200).json({
            success: true,
            message: 'Resource deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting resource:', error);
        return res.status(500).json({
            success: false,
            message: `Error deleting resource: ${error.message}`
        });
    }
};

exports.incrementDownloads = async (req, res) => {
    try {
        const { resourceId } = req.params;

        if (!resourceId) {
            return res.status(400).json({
                success: false,
                message: 'Resource ID is required'
            });
        }

        const resource = await resourceModel.findByIdAndUpdate(
            resourceId,
            { $inc: { downloads: 1 } },
            { new: true }
        );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        return res.status(200).json({
            success: true,
            downloads: resource.downloads
        });

    } catch (error) {
        console.error('Error incrementing downloads:', error);
        return res.status(500).json({
            success: false,
            message: `Error: ${error.message}`
        });
    }
};