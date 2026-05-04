import { endpoints } from '../api';

/**
 * Streams a Dhruv chat message via SSE.
 *
 * @param {Array}    messages  - Full conversation history [{role, content}]
 * @param {string}   token     - JWT auth token
 * @param {Function} onToken   - Called with each streamed text token (string)
 * @param {Function} onDone    - Called when stream is complete with full rawText
 * @param {Function} onError   - Called on network/parse error
 */
export const streamDhruvMessage = async (messages, token, onToken, onDone, onError) => {
    try {
        const response = await fetch(endpoints.DHRUV_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            credentials: 'include',
            body: JSON.stringify({ messages })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Hold the last incomplete line

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('data: ')) continue;

                const data = trimmed.slice(6);
                if (data === '[DONE]') {
                    onDone(fullText);
                    return;
                }

                try {
                    const parsed = JSON.parse(data);
                    if (parsed.error) {
                        onError(new Error(parsed.error));
                        return;
                    }
                    if (parsed.token != null) {
                        fullText += parsed.token;
                        onToken(parsed.token);
                    }
                } catch (_) {
                    // Skip malformed SSE lines
                }
            }
        }

        // Stream ended without [DONE] — still deliver what we have
        onDone(fullText);
    } catch (error) {
        onError(error);
    }
};

/**
 * Parse the [COURSE_DATA]{...}[/COURSE_DATA] block from Dhruv's raw response.
 * Returns the parsed object or null if not found / invalid JSON.
 */
export const extractCourseData = (rawText) => {
    const match = rawText.match(/\[COURSE_DATA\]([\s\S]*?)\[\/COURSE_DATA\]/);
    if (!match) return null;
    try {
        return JSON.parse(match[1].trim());
    } catch (_) {
        return null;
    }
};

/**
 * Strip the [COURSE_DATA]...[/COURSE_DATA] block from text for display.
 */
export const stripCourseData = (rawText) => {
    return rawText.replace(/\[COURSE_DATA\][\s\S]*?\[\/COURSE_DATA\]/g, '').trim();
};
