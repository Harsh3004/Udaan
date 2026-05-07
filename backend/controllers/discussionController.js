const discussionModel = require('../models/courseDiscussionModel');
const courseModel = require('../models/courseModel');

exports.createDiscussion = async (req, res) => {
    try {
        const { courseId, content, parentReplyId } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!courseId || !content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Course ID and content are required'
            });
        }

        if (content.length > 5000) {
            return res.status(400).json({
                success: false,
                message: 'Content too long (max 5000 characters)'
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
                message: 'Only enrolled students and course instructor can participate in discussions'
            });
        }

        let parentReply = null;
        if (parentReplyId) {
            parentReply = await discussionModel.findById(parentReplyId);
            if (!parentReply) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent reply not found'
                });
            }
            if (parentReply.parentReply) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot reply to a reply (nested replies not allowed)'
                });
            }
        }

        const discussion = await discussionModel.create({
            course: courseId,
            user: userId,
            content: content.trim(),
            parentReply: parentReplyId || null,
            isInstructorReply: userRole === 'Instructor'
        });

        if (parentReplyId) {
            await discussionModel.findByIdAndUpdate(parentReplyId, {
                $push: { replies: discussion._id }
            });
        }

        const populatedDiscussion = await discussionModel.findById(discussion._id)
            .populate('user', 'fName lName profileImage role');

        return res.status(201).json({
            success: true,
            message: parentReplyId ? 'Reply posted successfully' : 'Discussion created successfully',
            discussion: populatedDiscussion
        });

    } catch (error) {
        console.error('Error creating discussion:', error);
        return res.status(500).json({
            success: false,
            message: `Error creating discussion: ${error.message}`
        });
    }
};

exports.getDiscussions = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { page = 1, limit = 20 } = req.query;
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
                message: 'Only enrolled students and course instructor can view discussions'
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const discussions = await discussionModel.find({
            course: courseId,
            parentReply: null
        })
            .populate('user', 'fName lName profileImage role')
            .populate({
                path: 'replies',
                populate: {
                    path: 'user',
                    select: 'fName lName profileImage role'
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await discussionModel.countDocuments({
            course: courseId,
            parentReply: null
        });

        return res.status(200).json({
            success: true,
            discussions,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalDiscussions: total
            }
        });

    } catch (error) {
        console.error('Error fetching discussions:', error);
        return res.status(500).json({
            success: false,
            message: `Error fetching discussions: ${error.message}`
        });
    }
};

exports.deleteDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!discussionId) {
            return res.status(400).json({
                success: false,
                message: 'Discussion ID is required'
            });
        }

        const discussion = await discussionModel.findById(discussionId);
        if (!discussion) {
            return res.status(404).json({
                success: false,
                message: 'Discussion not found'
            });
        }

        if (discussion.user.toString() !== userId && userRole !== 'Admin') {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own discussions'
            });
        }

        if (discussion.replies && discussion.replies.length > 0) {
            await discussionModel.deleteMany({ parentReply: discussionId });
        }

        if (discussion.parentReply) {
            await discussionModel.findByIdAndUpdate(discussion.parentReply, {
                $pull: { replies: discussionId }
            });
        }

        await discussionModel.findByIdAndDelete(discussionId);

        return res.status(200).json({
            success: true,
            message: 'Discussion deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting discussion:', error);
        return res.status(500).json({
            success: false,
            message: `Error deleting discussion: ${error.message}`
        });
    }
};

exports.updateDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!discussionId) {
            return res.status(400).json({
                success: false,
                message: 'Discussion ID is required'
            });
        }

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Content is required'
            });
        }

        if (content.length > 5000) {
            return res.status(400).json({
                success: false,
                message: 'Content too long (max 5000 characters)'
            });
        }

        const discussion = await discussionModel.findById(discussionId);
        if (!discussion) {
            return res.status(404).json({
                success: false,
                message: 'Discussion not found'
            });
        }

        if (discussion.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own discussions'
            });
        }

        discussion.content = content.trim();
        discussion.updatedAt = new Date();
        await discussion.save();

        const populatedDiscussion = await discussionModel.findById(discussionId)
            .populate('user', 'fName lName profileImage role');

        return res.status(200).json({
            success: true,
            message: 'Discussion updated successfully',
            discussion: populatedDiscussion
        });

    } catch (error) {
        console.error('Error updating discussion:', error);
        return res.status(500).json({
            success: false,
            message: `Error updating discussion: ${error.message}`
        });
    }
};