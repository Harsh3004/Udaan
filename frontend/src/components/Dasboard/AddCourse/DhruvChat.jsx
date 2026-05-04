import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSelector } from 'react-redux';
import { FiSend, FiX, FiMenu } from 'react-icons/fi';
import DhruvSidebar from './DhruvSidebar';
import DhruvDraftReview from './DhruvDraftReview';
import { streamDhruvMessage, extractCourseData, stripCourseData } from '../../../services/operations/dhruvService';

// ── Typing indicator ────────────────────────────────────────────────────────
const TypingIndicator = () => (
    <div className="flex items-end gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-violet-900/40">D</div>
        <div className="bg-rich-black-800 border border-rich-black-600 rounded-2xl rounded-bl-sm px-4 py-3">
            <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="w-2 h-2 rounded-full bg-violet-400 block"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                    />
                ))}
            </div>
        </div>
    </div>
);

// ── Message bubble ──────────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
    const isUser = msg.role === 'user';
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-violet-900/40">D</div>
            )}
            {isUser && (
                <div className="w-8 h-8 rounded-full bg-rich-black-600 flex items-center justify-center text-rich-black-5 font-bold text-xs shrink-0">You</div>
            )}
            <div className={`max-w-[72%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                isUser
                    ? 'bg-violet-600 text-white rounded-br-sm'
                    : 'bg-rich-black-800 border border-rich-black-600 text-rich-black-5 rounded-bl-sm'
            }`}>
                {msg.content}
            </div>
        </motion.div>
    );
};

// ── Phase-based chip detection ───────────────────────────────────────────────
const getPhaseChips = (phase, lastContent) => {
    if (!lastContent) return [];
    switch (phase) {
        case 2:
            if (/difficulty|skill level|beginner|intermediate|advanced/i.test(lastContent))
                return ['Beginner', 'Intermediate', 'Advanced'];
            if (/language|taught in/i.test(lastContent))
                return ['English', 'Hindi', 'English & Hindi'];
            return [];
        case 4:
            if (/free or paid|pricing|charge|price/i.test(lastContent))
                return ['Free (₹0)', '₹499', '₹999', '₹1,999', '₹4,999'];
            return [];
        case 7:
            if (/shall|ready|confirm|looks good|view draft/i.test(lastContent))
                return ['Looks great!', 'I want to adjust something'];
            return [];
        default:
            return [];
    }
};

const defaultCourseData = {
    title: '', description: '', language: 'English', price: 0, category: '',
    tags: [], whatyouwilllearn: [], instructions: [], difficulty: '',
    targetAudience: '', modules: [], phase: 1,
};

// ── DhruvChat ────────────────────────────────────────────────────────────────
const DhruvChat = ({ onClose }) => {
    const token = useSelector((s) => s.auth.token);
    const user  = useSelector((s) => s.profile.user);
    const instructorName = user?.fName || 'there';

    const [messages,    setMessages]    = useState([]);
    const [courseData,  setCourseData]  = useState(defaultCourseData);
    const [inputValue,  setInputValue]  = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isTyping,    setIsTyping]    = useState(false);
    const [showDraft,   setShowDraft]   = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);

    const messagesContainerRef = useRef(null);
    const messagesEndRef       = useRef(null);
    const inputRef             = useRef(null);
    const hasGreeted           = useRef(false);

    // KEY FIX: always-current snapshot of messages — avoids stale closure in buildHistory
    const messagesRef = useRef([]);
    useEffect(() => { messagesRef.current = messages; }, [messages]);

    // ── Scroll: only when message count changes or streaming ends ────────────
    const scrollToBottom = useCallback((force = false) => {
        const c = messagesContainerRef.current;
        if (!c) return;
        const distFromBottom = c.scrollHeight - c.scrollTop - c.clientHeight;
        if (force || distFromBottom < 180) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        const last = messages[messages.length - 1];
        if (!last) return;
        if (last.role === 'user') scrollToBottom(true);
        else if (!isStreaming) scrollToBottom(false);
    // Only trigger on message count changes and isStreaming state, NOT on content
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages.length, isStreaming]);

    // ── Build history from ref (always current, no stale closure) ───────────
    const buildHistoryFromRef = useCallback(() =>
        messagesRef.current.map((m) => ({ role: m.role, content: m.rawContent || m.content })),
    []); // No deps — always reads from ref

    // ── Fire a Dhruv streaming response ─────────────────────────────────────
    const fireDhruvResponse = useCallback(async (history) => {
        setIsTyping(true);
        setIsStreaming(true);

        const msgId = `dhruv-${Date.now()}`;

        setMessages((prev) => [...prev, { id: msgId, role: 'assistant', content: '', rawContent: '' }]);

        let accumulated = '';

        await streamDhruvMessage(
            history,
            token,
            (tok) => {
                setIsTyping(false);
                accumulated += tok;
                const display = stripCourseData(accumulated);
                setMessages((prev) =>
                    prev.map((m) => m.id === msgId ? { ...m, content: display, rawContent: accumulated } : m)
                );
            },
            (fullText) => {
                const extracted = extractCourseData(fullText);
                if (extracted) {
                    setCourseData((prev) => ({ ...prev, ...extracted }));
                    if (extracted.phase >= 7) setTimeout(() => setShowDraft(true), 1500);
                }
                setIsTyping(false);
                setIsStreaming(false);
                inputRef.current?.focus();
            },
            (err) => {
                console.error('Dhruv stream error:', err);
                setIsTyping(false);
                setIsStreaming(false);
                setMessages((prev) =>
                    prev.map((m) => m.id === msgId
                        ? { ...m, content: '⚠️ Something went wrong. Please try again.' }
                        : m
                    )
                );
            }
        );
    }, [token]);

    // ── Initial greeting — guarded against React 18 StrictMode double-fire ──
    useEffect(() => {
        if (hasGreeted.current) return;
        hasGreeted.current = true;
        // The silent init message is NOT added to state; only Dhruv's greeting shows.
        // History for subsequent calls is built from messagesRef which is always current.
        fireDhruvResponse([{
            role: 'user',
            content: `Hi, my name is ${instructorName}. I want to create a new course.`
        }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Send user message ────────────────────────────────────────────────────
    const sendMessage = useCallback(async (text) => {
        const trimmed = text.trim();
        if (!trimmed || isStreaming) return;

        // Capture current history from ref BEFORE updating state
        const historySnapshot = buildHistoryFromRef();

        const userMsg = { id: `user-${Date.now()}`, role: 'user', content: trimmed, rawContent: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');

        // Build API history: previous messages + new user message
        const history = [...historySnapshot, { role: 'user', content: trimmed }];
        await fireDhruvResponse(history);
    }, [isStreaming, buildHistoryFromRef, fireDhruvResponse]);

    const handleSubmit = (e) => { e.preventDefault(); sendMessage(inputValue); };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputValue); }
        if (e.key === 'Escape') onClose();
    };

    // Chips: only from last message when not streaming
    const lastMsg = messages[messages.length - 1];
    const chips = (!isStreaming && lastMsg?.role === 'assistant')
        ? getPhaseChips(courseData.phase, lastMsg.content)
        : [];

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-rich-black-900">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-rich-black-700 bg-rich-black-900 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowSidebar((s) => !s)}
                        className="p-2 rounded-lg hover:bg-rich-black-700 text-rich-Black-300 hover:text-rich-black-5 transition-colors md:hidden"
                        aria-label="Toggle sidebar">
                        <FiMenu className="w-5 h-5" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-violet-900/40">D</div>
                    <div>
                        <p className="font-bold text-rich-black-5 leading-tight">Dhruv</p>
                        <p className="text-xs text-violet-400 leading-tight">
                            {isStreaming ? '● thinking…' : '● AI Course Assistant'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {courseData.title && !showDraft && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setShowDraft(true)}
                            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-600/20 border border-violet-600/30 text-violet-300 hover:bg-violet-600/30 transition-colors">
                            View Draft →
                        </motion.button>
                    )}
                    <button onClick={onClose}
                        className="p-2 rounded-lg hover:bg-rich-black-700 text-rich-Black-300 hover:text-red-400 transition-colors"
                        aria-label="Close Dhruv">
                        <FiX className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <AnimatePresence>
                    {showSidebar && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 288, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden shrink-0 hidden md:block">
                            <DhruvSidebar courseData={courseData} onViewDraft={() => setShowDraft(true)} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main pane */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <AnimatePresence mode="wait">
                        {showDraft ? (
                            <DhruvDraftReview
                                key="draft"
                                courseData={courseData}
                                onBack={() => setShowDraft(false)}
                                onSuccess={onClose}
                            />
                        ) : (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col flex-1 overflow-hidden"
                            >
                                {/* Message list */}
                                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
                                    {messages.map((msg) => (
                                        <MessageBubble key={msg.id} msg={msg} />
                                    ))}
                                    {isTyping && <TypingIndicator />}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Quick-reply chips */}
                                <AnimatePresence>
                                    {chips.length > 0 && (
                                        <motion.div
                                            key={`chips-${courseData.phase}`}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            className="px-4 sm:px-8 pb-2 flex flex-wrap gap-2">
                                            {chips.map((chip) => (
                                                <button key={chip} onClick={() => sendMessage(chip)}
                                                    className="px-4 py-1.5 rounded-full border border-violet-600/50 text-violet-300 text-sm bg-violet-950/30 hover:bg-violet-600/20 hover:border-violet-500 transition-all duration-150 font-medium">
                                                    {chip}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Input bar */}
                                <div className="px-4 sm:px-8 pb-5 pt-2 border-t border-rich-black-700 bg-rich-black-900">
                                    <form onSubmit={handleSubmit} className="flex items-end gap-3">
                                        <textarea
                                            ref={inputRef}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
                                            rows={1}
                                            disabled={isStreaming}
                                            className="flex-1 resize-none bg-rich-black-800 border border-rich-black-600 text-rich-black-5 placeholder-rich-Black-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 transition-colors duration-150 disabled:opacity-50 max-h-32 overflow-y-auto"
                                            style={{ lineHeight: '1.5' }}
                                            onInput={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                                            }}
                                        />
                                        <button type="submit" disabled={isStreaming || !inputValue.trim()}
                                            className="w-11 h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-violet-900/30"
                                            aria-label="Send">
                                            <FiSend className="w-4 h-4" />
                                        </button>
                                    </form>
                                    <p className="text-xs text-rich-Black-300 mt-2 text-center select-none">
                                        Dhruv asks one question at a time •{' '}
                                        <kbd className="px-1 py-0.5 bg-rich-black-700 rounded text-[10px]">Esc</kbd> to close
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default DhruvChat;
