const express = require('express');
const { auth, isStudent, isInstructor } = require('../middlewares/Auth');
const {
    sendMessage,
    getMessages,
    getStudentConversations,
    getInstructorConversations,
    markAsRead,
    checkChatExists,
    deleteMessage,
    deleteChat
} = require('../controllers/chatController');

const router = express.Router();

router.post('/send', auth, sendMessage);
router.get('/messages/:courseId', auth, getMessages);
router.get('/conversations/student', auth, isStudent, getStudentConversations);
router.get('/conversations/instructor', auth, isInstructor, getInstructorConversations);
router.put('/read/:courseId', auth, markAsRead);
router.get('/check/:courseId', auth, checkChatExists);
router.delete('/message', auth, deleteMessage);
router.delete('/:courseId', auth, deleteChat);

module.exports = router;