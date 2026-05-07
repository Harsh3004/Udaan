const chatModel = require('../models/chatModel');
const courseModel = require('../models/courseModel');
const userModel = require('../models/userModel');
const { emitNewMessage, emitMessageDeleted, emitMessagesRead } = require('../config/socket');

exports.sendMessage = async (req, res) => {
    try {
        const { courseId, content } = req.body;
        const senderId = req.user.id;
        const senderRole = req.user.role;

        if (!courseId || !content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Course ID and message content are required'
            });
        }

        if (content.length > 2000) {
            return res.status(400).json({
                success: false,
                message: 'Message too long (max 2000 characters)'
            });
        }

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        let chat;
        if (senderRole === 'Student') {
            chat = await chatModel.findOne({ course: courseId, student: senderId });
        } else if (senderRole === 'Instructor') {
            chat = await chatModel.findOne({ course: courseId, instructor: senderId });
        } else {
            return res.status(403).json({
                success: false,
                message: 'Invalid sender role'
            });
        }

        let recipientId;
        let recipientRole;

        if (!chat) {
            if (senderRole === 'Student') {
                const isEnrolled = course.studentEnrolled.includes(senderId);
                if (!isEnrolled) {
                    return res.status(403).json({
                        success: false,
                        message: 'You must be enrolled to message the instructor'
                    });
                }
                chat = await chatModel.create({
                    course: courseId,
                    student: senderId,
                    instructor: course.instructor,
                    messages: [{
                        sender: senderId,
                        content: content.trim(),
                        read: false
                    }],
                    lastMessage: content.trim().substring(0, 100),
                    lastMessageAt: new Date(),
                    studentUnreadCount: 0,
                    instructorUnreadCount: 1
                });
                recipientId = course.instructor;
                recipientRole = 'Instructor';
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'No conversation found. Student must message first.'
                });
            }
        } else {
            if (senderRole === 'Student' && chat.student.toString() !== senderId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized to send message'
                });
            }
            if (senderRole === 'Instructor' && chat.instructor.toString() !== senderId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized to send message'
                });
            }

            chat.messages.push({
                sender: senderId,
                content: content.trim(),
                read: false
            });
            chat.lastMessage = content.trim().substring(0, 100);
            chat.lastMessageAt = new Date();

            if (senderRole === 'Student') {
                chat.instructorUnreadCount += 1;
            } else {
                chat.studentUnreadCount += 1;
            }

            await chat.save();
            recipientId = senderRole === 'Student' ? chat.instructor : chat.student;
            recipientRole = senderRole === 'Student' ? 'Instructor' : 'Student';
        }

        const updatedChat = await chatModel.findById(chat._id)
            .populate('student', 'fName lName profileImage')
            .populate('instructor', 'fName lName profileImage')
            .populate('messages.sender', 'fName lName profileImage');

        // Emit socket event for real-time update with properly populated message
        const lastMessage = updatedChat.messages[updatedChat.messages.length - 1];
        emitNewMessage(courseId, lastMessage.toObject());

        return res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            chat: updatedChat
        });

    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({
            success: false,
            message: `Error sending message: ${error.message}`
        });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID is required'
            });
        }

        let chat;
        if (userRole === 'Student') {
            chat = await chatModel.findOne({ course: courseId, student: userId })
                .populate('student', 'fName lName profileImage')
                .populate('instructor', 'fName lName profileImage')
                .populate('messages.sender', 'fName lName profileImage');

            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: 'No conversation found'
                });
            }

            chat.messages.forEach(msg => {
                if (msg.sender.toString() !== userId) {
                    msg.read = true;
                }
            });
            chat.studentUnreadCount = 0;
            await chat.save();
        } else if (userRole === 'Instructor') {
            const course = await courseModel.findById(courseId);
            if (!course || course.instructor.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized to view these messages'
                });
            }

            chat = await chatModel.findOne({ course: courseId })
                .populate('student', 'fName lName profileImage')
                .populate('instructor', 'fName lName profileImage')
                .populate('messages.sender', 'fName lName profileImage');
        } else {
            return res.status(403).json({
                success: false,
                message: 'Invalid role'
            });
        }

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'No conversation found'
            });
        }

        return res.status(200).json({
            success: true,
            chat
        });

    } catch (error) {
        console.error('Error fetching messages:', error);
        return res.status(500).json({
            success: false,
            message: `Error fetching messages: ${error.message}`
        });
    }
};

exports.getStudentConversations = async (req, res) => {
    try {
        const studentId = req.user.id;

        const conversations = await chatModel.find({ student: studentId })
            .populate('course', 'title thumbnail')
            .populate('instructor', 'fName lName profileImage')
            .sort({ lastMessageAt: -1 });

        return res.status(200).json({
            success: true,
            conversations
        });

    } catch (error) {
        console.error('Error fetching conversations:', error);
        return res.status(500).json({
            success: false,
            message: `Error fetching conversations: ${error.message}`
        });
    }
};

exports.getInstructorConversations = async (req, res) => {
    try {
        const instructorId = req.user.id;

        const conversations = await chatModel.find({ instructor: instructorId })
            .populate('course', 'title thumbnail')
            .populate('student', 'fName lName profileImage')
            .sort({ lastMessageAt: -1 });

        return res.status(200).json({
            success: true,
            conversations
        });

    } catch (error) {
        console.error('Error fetching conversations:', error);
        return res.status(500).json({
            success: false,
            message: `Error fetching conversations: ${error.message}`
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const chat = await chatModel.findOne({ course: courseId });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        if (userRole === 'Student' && chat.student.toString() === userId) {
            chat.studentUnreadCount = 0;
        } else if (userRole === 'Instructor' && chat.instructor.toString() === userId) {
            chat.instructorUnreadCount = 0;
        }

        chat.messages.forEach(msg => {
            if (msg.sender.toString() !== userId) {
                msg.read = true;
            }
        });

        await chat.save();

        // Emit socket event for real-time update
        emitMessagesRead(courseId, userId);

        return res.status(200).json({
            success: true,
            message: 'Messages marked as read'
        });

    } catch (error) {
        console.error('Error marking messages as read:', error);
        return res.status(500).json({
            success: false,
            message: `Error marking messages as read: ${error.message}`
        });
    }
};

exports.checkChatExists = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const chat = await chatModel.findOne({ course: courseId, student: userId })
            .select('_id messages studentUnreadCount instructorUnreadCount');

        if (!chat) {
            return res.status(200).json({
                success: true,
                exists: false,
                unreadCount: 0
            });
        }

        if (!chat.student) {
            return res.status(200).json({
                success: true,
                exists: false,
                unreadCount: 0
            });
        }

        const isStudent = chat.student.toString() === userId;
        const unreadCount = isStudent ? chat.studentUnreadCount : chat.instructorUnreadCount;

        return res.status(200).json({
            success: true,
            exists: true,
            unreadCount,
            hasMessages: chat.messages.length > 0
        });

    } catch (error) {
        console.error('Error checking chat:', error);
        return res.status(500).json({
            success: false,
            message: `Error: ${error.message}`
        });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const { courseId, messageId } = req.body;
        const userId = req.user.id;

        if (!courseId || !messageId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID and Message ID are required'
            });
        }

        const chat = await chatModel.findOne({ course: courseId });
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        const messageIndex = chat.messages.findIndex(
            msg => msg._id.toString() === messageId
        );

        if (messageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        const message = chat.messages[messageIndex];

        if (message.sender.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own messages'
            });
        }

        chat.messages.splice(messageIndex, 1);

        if (chat.messages.length > 0) {
            chat.lastMessage = chat.messages[chat.messages.length - 1].content;
            chat.lastMessageAt = chat.messages[chat.messages.length - 1].createdAt;
        } else {
            chat.lastMessage = '';
            chat.lastMessageAt = new Date();
        }

        await chat.save();

        // Emit socket event for real-time update
        emitMessageDeleted(courseId, messageId, userId);

        return res.status(200).json({
            success: true,
            message: 'Message deleted successfully',
            chat
        });

    } catch (error) {
        console.error('Error deleting message:', error);
        return res.status(500).json({
            success: false,
            message: `Error deleting message: ${error.message}`
        });
    }
};

exports.deleteChat = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID is required'
            });
        }

        let chat;
        if (userRole === 'Student') {
            chat = await chatModel.findOne({ course: courseId, student: userId });
        } else if (userRole === 'Instructor') {
            chat = await chatModel.findOne({ course: courseId, instructor: userId });
        } else {
            return res.status(403).json({
                success: false,
                message: 'Invalid role'
            });
        }

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        await chatModel.findByIdAndDelete(chat._id);

        return res.status(200).json({
            success: true,
            message: 'Conversation deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting chat:', error);
        return res.status(500).json({
            success: false,
            message: `Error deleting chat: ${error.message}`
        });
    }
};