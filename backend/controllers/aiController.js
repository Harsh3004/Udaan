const courseNoteModel = require('../models/courseNoteModel');
const courseModel = require('../models/courseModel');
const subsectionModel = require('../models/subsectionModel');

require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * POST /api/ai/ask
 * Asks the Groq AI a question in the context of the current course lesson.
 * Body: { question, courseId, subsectionId }
 */
exports.askAI = async (req, res) => {
    try {
        const { question, courseId, subsectionId } = req.body;
        // const userId = req.user.id; // Uncomment if you are tracking usage per user

        if (!question || !courseId || !subsectionId) {
            return res.status(400).json({
                success: false,
                message: 'Missing question, courseId, or subsectionId'
            });
        }

        if (!GROQ_API_KEY) {
            return res.status(500).json({
                success: false,
                message: 'AI service is not configured. Please add GROQ_API_KEY to environment variables.'
            });
        }

        // Fetch course + subsection for rich context
        const [course, subsection] = await Promise.all([
            courseModel.findById(courseId).select('title desc').lean(),
            subsectionModel.findById(subsectionId).select('topic description aiContext').lean()
        ]);

        if (!course || !subsection) {
            return res.status(404).json({ success: false, message: 'Course or lesson not found' });
        }

        // Build a structured system prompt grounded in the lesson content
        const systemPrompt = [
            `You are a helpful, concise AI learning assistant for an online course platform called Udaan.`,
            `The student is currently enrolled in the course: "${course.title}".`,
            `They are watching the lesson: "${subsection.topic}".`,
            subsection.description ? `Lesson description: "${subsection.description}"` : '',
            subsection.aiContext ? `Instructor's additional context for this lesson: "${subsection.aiContext}"` : '',
            `\nInstructions:`,
            `- Answer the student's question directly and concisely.`,
            `- Stay focused on the context of this lesson and course.`,
            `- If you don't know the answer, say so honestly.`,
            `- Use markdown formatting (bold, code blocks, bullet points) for clarity.`,
            `- Keep responses under 400 words unless the question explicitly requires more detail.`
        ].filter(Boolean).join('\n');

        // Construct the Groq (OpenAI-compatible) request body
        const requestBody = {
            model: "llama-3.3-70b-versatile", // Fast and highly capable model
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: question
                }
            ],
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 0.95
        };

        const groqResponse = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}` 
            },
            body: JSON.stringify(requestBody)
        });

        if (!groqResponse.ok) {
            const errBody = await groqResponse.text();
            console.error('Groq API error:', errBody);
            return res.status(502).json({
                success: false,
                message: 'AI service returned an error. Please try again.'
            });
        }

        const groqData = await groqResponse.json();
        const aiAnswer = groqData?.choices?.[0]?.message?.content;

        if (!aiAnswer) {
            return res.status(502).json({
                success: false,
                message: 'AI returned an empty response. Please try again.'
            });
        }

        return res.status(200).json({
            success: true,
            answer: aiAnswer,
            context: {
                course: course.title,
                lesson: subsection.topic
            }
        });

    } catch (error) {
        console.error('Error in askAI:', error);
        return res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`
        });
    }
};

/**
 * POST /api/ai/notes
 * Saves or updates a personal note for a specific lesson.
 * Body: { courseId, subsectionId, content, videoTimestamp }
 */
exports.saveNote = async (req, res) => {
    try {
        const { courseId, subsectionId, content, videoTimestamp } = req.body;
        const userId = req.user.id;

        if (!courseId || !subsectionId || !content?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Missing courseId, subsectionId, or note content'
            });
        }

        const note = await courseNoteModel.create({
            userId,
            courseId,
            subsectionId,
            content: content.trim(),
            videoTimestamp: videoTimestamp || null
        });

        return res.status(201).json({
            success: true,
            message: 'Note saved successfully',
            note
        });

    } catch (error) {
        console.error('Error in saveNote:', error);
        return res.status(500).json({
            success: false,
            message: `Error saving note: ${error.message}`
        });
    }
};

/**
 * GET /api/ai/notes/:subsectionId
 * Retrieves all personal notes for a student for a specific lesson.
 */
exports.getNotes = async (req, res) => {
    try {
        const { subsectionId } = req.params;
        const userId = req.user.id;

        if (!subsectionId) {
            return res.status(400).json({ success: false, message: 'Missing subsectionId' });
        }

        const notes = await courseNoteModel
            .find({ userId, subsectionId })
            .sort({ videoTimestamp: 1, createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            notes
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error fetching notes: ${error.message}`
        });
    }
};

/**
 * DELETE /api/ai/notes/:noteId
 * Deletes a specific note.
 */
exports.deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user.id;

        const note = await courseNoteModel.findOneAndDelete({ _id: noteId, userId });

        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        return res.status(200).json({ success: true, message: 'Note deleted successfully' });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error deleting note: ${error.message}`
        });
    }
};