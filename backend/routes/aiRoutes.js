const express = require('express');
const { auth } = require('../middlewares/Auth');
const { askAI, saveNote, getNotes, deleteNote } = require('../controllers/aiController');

const router = express.Router();

// AI Q&A — ask a question in the context of a course lesson
router.post('/ask', auth, askAI);

// Personal Notes — CRUD
router.post('/notes', auth, saveNote);
router.get('/notes/:subsectionId', auth, getNotes);
router.delete('/notes/:noteId', auth, deleteNote);

module.exports = router;
