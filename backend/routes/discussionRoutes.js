const express = require('express');
const { auth, isInstructor, isStudent } = require('../middlewares/Auth');
const { createDiscussion, getDiscussions, deleteDiscussion, updateDiscussion } = require('../controllers/discussionController');
const router = express.Router();

router.post('/create', auth, createDiscussion);
router.get('/:courseId', auth, getDiscussions);
router.put('/update/:discussionId', auth, updateDiscussion);
router.delete('/delete/:discussionId', auth, deleteDiscussion);

module.exports = router;