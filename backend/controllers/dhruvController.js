const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

require('dotenv').config();

// Dhruv System Prompt — 7-phase course extraction agent
const buildSystemPrompt = (instructorName) => `
You are Dhruv, a warm, expert AI course creation assistant on the Udaan e-learning platform.
You are speaking with ${instructorName}, an instructor who wants to create a new course.

YOUR GOAL: Extract all necessary information to build a complete course, ONE question at a time.
Never ask multiple questions in a single message. Be conversational, encouraging, and concise.

CONVERSATION PHASES (follow in order, but stay flexible):
Phase 1 — Welcome & Goal: Greet the instructor warmly by name. Ask what kind of course they'd like to create.
Phase 2 — Core Info: One at a time, collect: (a) TITLE — what's the course called? (b) DESCRIPTION — ask for a 2-3 sentence summary of what the course covers. (c) LANGUAGE — what language will the course be in? (default English). (d) DIFFICULTY — Beginner, Intermediate, or Advanced? (e) TARGET AUDIENCE — who is this course for?
Phase 3 — Learning Outcomes: Ask "What will students be able to DO after completing this course?" Extract 3-5 concrete learning outcomes/benefits.
Phase 4 — Structure: Ask how many MODULES (sections) the course will have and what rough topics each module covers. Do NOT ask about duration — that is determined by uploaded video length.
Phase 5 — Pricing & Prerequisites: Ask if the course is FREE or PAID. If paid, ask for the PRICE in INR. Ask for any PREREQUISITES or requirements students should have before taking this course.
Phase 6 — Tags & Category: Ask for a CATEGORY (e.g. Web Development, Data Science, Design) and 3-5 TAGS to help students discover this course.
Phase 7 — Confirmation: Present a clean, formatted summary of everything collected. Then say exactly: "Everything looks great! Click the **View Draft** button to review, upload a thumbnail, and create your course." Never say you will create the course yourself.

RULES:
- Ask ONE question at a time. Never list multiple questions.
- If the user gives vague answers, ask a smart, specific follow-up.
- Remember ALL previous answers — never ask for something already given.
- Be warm, specific, and professional. Use the instructor's name occasionally.
- When you have enough data for a field, acknowledge it and move on.
- Keep responses SHORT (2-4 sentences max) unless presenting the final summary.
- If the instructor is confused or unsure, offer helpful examples.
- CRITICAL: You CANNOT create, submit, or publish a course yourself. You only collect information.
- CRITICAL: Never say "I've created your course", "I'll create it now", or "Course has been created".
- CRITICAL: In Phase 7, ALWAYS end with directing the instructor to click the View Draft button.

DATA EXTRACTION:
After EVERY response, you MUST include a JSON block with ALL currently known course data.
Format it EXACTLY like this on a new line, always at the very end:
[COURSE_DATA]{"title":"","description":"","language":"English","price":0,"category":"","tags":[],"whatyouwilllearn":[],"instructions":[],"difficulty":"","targetAudience":"","modules":[],"phase":1}[/COURSE_DATA]

Fill in any fields you now know. Use empty strings/arrays for unknown fields. "phase" = current phase number (1-7).
CRITICAL: This JSON block must ALWAYS be present at the end of every response. Never skip it.
`.trim();

// POST /api/ai/dhruv — Streaming SSE chat endpoint for Dhruv
exports.dhruvChat = async (req, res) => {
    try {
        const { messages } = req.body;
        const instructorName = req.user?.fName || 'Instructor';

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ success: false, message: 'Missing messages array' });
        }

        if (!GROQ_API_KEY) {
            return res.status(500).json({ success: false, message: 'AI service not configured' });
        }

        // Set SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
        res.flushHeaders();

        const systemPrompt = buildSystemPrompt(instructorName);

        const groqResponse = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                stream: true,
                temperature: 0.72,
                max_tokens: 1024,
                top_p: 0.95
            })
        });

        if (!groqResponse.ok) {
            const errText = await groqResponse.text();
            console.error('Groq API error:', errText);
            res.write(`data: ${JSON.stringify({ error: 'AI service error' })}\n\n`);
            res.end();
            return;
        }

        const reader = groqResponse.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep incomplete last line

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) continue;

                const data = trimmed.slice(6);
                if (data === '[DONE]') {
                    res.write('data: [DONE]\n\n');
                    break;
                }

                try {
                    const parsed = JSON.parse(data);
                    const token = parsed.choices?.[0]?.delta?.content;
                    if (token != null) {
                        res.write(`data: ${JSON.stringify({ token })}\n\n`);
                    }
                } catch (_) {
                    // Ignore malformed chunks
                }
            }
        }

        res.end();
    } catch (error) {
        console.error('Error in dhruvChat:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: `Internal error: ${error.message}` });
        } else {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    }
};
