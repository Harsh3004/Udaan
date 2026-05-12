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

/**
 * POST /api/ai/generate-quiz
 * Generates a quiz based on the topic of the current lesson.
 * Body: { topic, courseId, subsectionId, numQuestions }
 */
exports.generateQuiz = async (req, res) => {
    try {
        const { topic, courseId, subsectionId, numQuestions = 5 } = req.body;

        if (!topic || !courseId || !subsectionId) {
            return res.status(400).json({
                success: false,
                message: 'Missing topic, courseId, or subsectionId'
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

        // Build system prompt for quiz generation
        const systemPrompt = [
            `You are an expert educational quiz generator for an online course platform called Udaan.`,
            `Generate multiple-choice questions based on the lesson topic.`,
            `Return ONLY a valid JSON object with a "questions" array.`,
            `Each question must have:`,
            `- "question": the question text`,
            `- "options": an array of exactly 4 strings (the possible answers)`,
            `- "correctAnswer": an integer (0, 1, 2, or 3) representing the index of the correct answer`,
            `\nContext:`,
            `Course: "${course.title}"`,
            `Lesson Topic: "${subsection.topic}"`,
            subsection.description ? `Lesson Description: "${subsection.description}"` : '',
            subsection.aiContext ? `Instructor's Context: "${subsection.aiContext}"` : '',
            `\nExample format:`,
            `{"questions": [{"question": "What is X?", "options": ["A", "B", "C", "D"], "correctAnswer": 0}]}`
        ].filter(Boolean).join('\n');

        const userPrompt = `Generate ${numQuestions} multiple-choice questions about "${topic}". Return ONLY the JSON object.`;

        // Construct the Groq request
        const requestBody = {
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 0.95,
            response_format: { type: "json_object" } // Enforce JSON output
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
        const aiResponse = groqData?.choices?.[0]?.message?.content;

        if (!aiResponse) {
            return res.status(502).json({
                success: false,
                message: 'AI returned an empty response. Please try again.'
            });
        }

        // Parse the JSON response
        let quizData;
        try {
            // Extract JSON from possible markdown code blocks
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
            quizData = JSON.parse(jsonString);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', aiResponse);
            return res.status(502).json({
                success: false,
                message: 'AI returned invalid JSON. Please try again.'
            });
        }

        // Validate the structure
        if (!quizData.questions || !Array.isArray(quizData.questions)) {
            return res.status(502).json({
                success: false,
                message: 'AI returned invalid quiz format. Please try again.'
            });
        }

        // Validate each question has required fields
        for (const q of quizData.questions) {
            if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
                typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
                return res.status(502).json({
                    success: false,
                    message: 'AI returned invalid question format. Please try again.'
                });
            }
        }

        return res.status(200).json({
            success: true,
            quiz: {
                topic: topic,
                questions: quizData.questions,
                generatedAt: new Date()
            },
            context: {
                course: course.title,
                lesson: subsection.topic
            }
        });

    } catch (error) {
        console.error('Error in generateQuiz:', error);
        return res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`
        });
    }
};

/**
 * POST /api/ai/review-course
 * Generates an AI review for a course based on its structure and video content.
 * Can be called as an Express route handler or internally (if req is passed).
 */
exports.generateCourseReview = async (req, res) => {
    try {
        const courseId = req.body?.courseId || req.courseId;

        if (!courseId) {
            if (res) return res.status(400).json({ success: false, message: 'Missing courseId' });
            return null;
        }

        if (!GROQ_API_KEY) {
            if (res) return res.status(500).json({ success: false, message: 'AI service is not configured.' });
            return null;
        }

        const course = await courseModel.findById(courseId).populate({
            path: 'section',
            populate: {
                path: 'subsection'
            }
        });

        if (!course) {
            if (res) return res.status(404).json({ success: false, message: 'Course not found' });
            return null;
        }

        // Only generate review for published courses
        if (course.status !== 'Published') {
            if (res) return res.status(400).json({ success: false, message: 'AI Review can only be generated for published courses.' });
            return null;
        }

        let courseContentSummary = '';

        // Process videos
        for (const section of course.section) {
            courseContentSummary += `\nSection: ${section.sectionName}\n`;
            for (const subsection of section.subsection) {
                courseContentSummary += `  Lesson: ${subsection.topic}\n`;
                if (subsection.description) {
                    courseContentSummary += `  Description: ${subsection.description}\n`;
                }

                if (subsection.file && subsection.file.url) {
                    try {
                        const audioUrl = subsection.file.url
                            .replace('/upload/', '/upload/f_mp3,ac_mp3,br_32k/')
                            .replace(/\.[^/.]+$/, ".mp3");
                        
                        const audioRes = await fetch(audioUrl);
                        if (audioRes.ok) {
                            const audioBlob = await audioRes.blob();
                            
                            const formData = new FormData();
                            formData.append('file', audioBlob, 'audio.mp3');
                            formData.append('model', 'whisper-large-v3');

                            const whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${GROQ_API_KEY}`
                                },
                                body: formData
                            });

                            if (whisperRes.ok) {
                                const transcriptData = await whisperRes.json();
                                const transcript = transcriptData.text;
                                
                                if (transcript && transcript.trim()) {
                                    // Summarize transcript
                                    const summaryPrompt = `Summarize the following video transcript for a course lesson. Be concise and capture the key educational points.\n\nTranscript: ${transcript.substring(0, 30000)}`;
                                    
                                    const summaryRes = await fetch(GROQ_API_URL, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
                                        body: JSON.stringify({
                                            model: "llama-3.3-70b-versatile",
                                            messages: [{ role: "user", content: summaryPrompt }],
                                            temperature: 0.5,
                                            max_tokens: 500
                                        })
                                    });
                                    
                                    if (summaryRes.ok) {
                                        const summaryData = await summaryRes.json();
                                        courseContentSummary += `  Video Summary: ${summaryData.choices[0].message.content}\n`;
                                    } else {
                                        courseContentSummary += `  Video Transcript: ${transcript.substring(0, 500)}...\n`;
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        console.error('Error transcribing video for subsection:', subsection._id, err);
                    }
                }
            }
        }

        // Final evaluation
        const systemPrompt = `You are an expert educational course evaluator. Evaluate the following course based on its structure, metadata, and the detailed video summaries provided. Provide a JSON response with the following format:
{
    "score": <number between 1 and 100>,
    "summary": "<a compelling, 2-3 sentence overview of the course quality>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>"]
}

Course Title: ${course.title}
Course Description: ${course.desc}
What you will learn: ${course.whatyouwilllearn?.join(', ')}
Course Content:
${courseContentSummary}`;

        const evalRes = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "system", content: systemPrompt }],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        if (!evalRes.ok) {
            throw new Error('Failed to generate final evaluation');
        }

        const evalData = await evalRes.json();
        const aiReviewStr = evalData.choices[0].message.content;
        const aiReview = JSON.parse(aiReviewStr);

        course.aiReview = aiReview;
        await course.save();

        if (res) {
            return res.status(200).json({ success: true, aiReview });
        } else {
            return aiReview;
        }
    } catch (error) {
        console.error('Error generating course review:', error);
        if (res) {
            return res.status(500).json({ success: false, message: error.message });
        }
        return null;
    }
};