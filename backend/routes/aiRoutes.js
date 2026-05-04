const express = require('express');
const { auth, isInstructor } = require('../middlewares/Auth');
const { askAI, saveNote, getNotes, deleteNote, generateQuiz } = require('../controllers/aiController');
const { dhruvChat } = require('../controllers/dhruvController');

const router = express.Router();

// AI Q&A — ask a question in the context of a course lesson
router.post('/ask', auth, askAI);

// Generate quiz based on lesson topic
router.post('/generate-quiz', auth, generateQuiz);

// Personal Notes — CRUD
router.post('/notes', auth, saveNote);
router.get('/notes/:subsectionId', auth, getNotes);
router.delete('/notes/:noteId', auth, deleteNote);

// Dhruv — AI course creation agent (streaming SSE)
router.post('/dhruv', auth, dhruvChat);

module.exports = router;
