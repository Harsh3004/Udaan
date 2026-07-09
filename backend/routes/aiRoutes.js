const express = require('express');
const { auth, isInstructor } = require('../middlewares/Auth');
const { askAI, saveNote, getNotes, deleteNote, generateQuiz, generateCourseReview } = require('../controllers/aiController');
const { dhruvChat } = require('../controllers/dhruvController');
const { aiLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// AI Q&A — rate limited to prevent Groq credit abuse
router.post('/ask', auth, aiLimiter, askAI);

// Generate quiz based on lesson topic
router.post('/generate-quiz', auth, aiLimiter, generateQuiz);

// AI Course Review — heavy endpoint, instructor-only
router.post('/review-course', auth, isInstructor, aiLimiter, generateCourseReview);

router.post('/notes', auth, saveNote);
router.get('/notes/:subsectionId', auth, getNotes);
router.delete('/notes/:noteId', auth, deleteNote);

// Dhruv — AI course creation agent (streaming SSE)
router.post('/dhruv', auth, aiLimiter, dhruvChat);

module.exports = router;
