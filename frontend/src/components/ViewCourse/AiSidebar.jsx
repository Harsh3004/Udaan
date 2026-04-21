import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiLoader, FiX, FiCpu, FiUser, FiBookmark, FiChevronDown } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { endpoints } from '../../services/api';
import { request } from '../../services/operations/authApi';

// Simple markdown renderer for bold, code, and bullet points
const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Code blocks
    if (line.startsWith('```')) return null;
    // Bullet points
    if (line.match(/^[-*]\s/)) {
      const content = line.replace(/^[-*]\s/, '');
      return (
        <li key={i} className="ml-4 text-sm text-rich-black-100 leading-relaxed list-disc">
          {renderInline(content)}
        </li>
      );
    }
    // Headings
    if (line.startsWith('### ')) return <p key={i} className="font-bold text-white text-sm mt-3">{line.slice(4)}</p>;
    if (line.startsWith('## ')) return <p key={i} className="font-bold text-white text-sm mt-3">{line.slice(3)}</p>;
    // Empty line
    if (line.trim() === '') return <br key={i} />;
    return <p key={i} className="text-sm text-rich-black-100 leading-relaxed">{renderInline(line)}</p>;
  });
};

const renderInline = (text) => {
  // Bold
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-rich-black-800 text-yellow-50 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const MessageBubble = ({ message, onSaveNote }) => {
  const isAI = message.role === 'ai';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isAI ? 'items-start' : 'items-start flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isAI ? 'bg-yellow-50/10 text-yellow-50' : 'bg-blue-500/20 text-blue-400'}`}>
        {isAI ? <FiCpu size={16} /> : <FiUser size={16} />}
      </div>

      <div className={`max-w-[85%] ${isAI ? '' : 'items-end flex flex-col'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm ${
          isAI
            ? 'bg-rich-black-800/80 border border-rich-black-700 rounded-tl-sm'
            : 'bg-blue-600/20 border border-blue-500/20 rounded-tr-sm'
        }`}>
          {isAI ? (
            <div className="space-y-1">{renderMarkdown(message.content)}</div>
          ) : (
            <p className="text-sm text-rich-black-50">{message.content}</p>
          )}
        </div>

        {/* Save as Note button for AI responses */}
        {isAI && onSaveNote && (
          <button
            onClick={() => onSaveNote(message.content)}
            className="mt-1.5 ml-1 flex items-center gap-1.5 text-[11px] text-rich-black-400 hover:text-yellow-50 transition-colors"
          >
            <FiBookmark size={11} />
            Save as Note
          </button>
        )}
      </div>
    </motion.div>
  );
};

const AiSidebar = ({ courseId, currentVideo, token }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: `👋 Hi! I'm your AI study assistant for this course. Ask me anything about **${currentVideo?.topic || 'this lesson'}** and I'll help you understand it better.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveNoteLoading, setSaveNoteLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Update greeting when video changes
  useEffect(() => {
    if (currentVideo?.topic) {
      setMessages([{
        role: 'ai',
        content: `👋 Hi! I'm your AI study assistant. Ask me anything about **${currentVideo.topic}** and I'll explain it clearly.`
      }]);
    }
  }, [currentVideo?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendMessage = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setIsLoading(true);

    try {
      const res = await request(endpoints.AI_ASK_API, 'POST', {
        question,
        courseId,
        subsectionId: currentVideo._id
      }, token);
      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
      } else {
        toast.error(data.message || 'AI failed to respond. Please try again.');
        setMessages(prev => [...prev, { role: 'ai', content: `Sorry, I encountered an error: ${data.message}` }]);
      }
    } catch (err) {
      toast.error('Connection error. Please check your network.');
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsNote = async (content) => {
    if (!currentVideo || saveNoteLoading) return;
    setSaveNoteLoading(true);
    try {
      const res = await request(endpoints.AI_SAVE_NOTE_API, 'POST', {
        courseId,
        subsectionId: currentVideo._id,
        content: `[AI Answer]\n${content}`
      }, token);
      const data = await res.json();
      if (data.success) toast.success('Saved to Personal Notes!');
      else toast.error('Failed to save note');
    } catch (err) {
      toast.error('Error saving note');
    } finally {
      setSaveNoteLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    'Can you explain this concept simply?',
    'What are common mistakes to avoid?',
    'Give me a real-world example.',
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-2.5 px-5 py-3.5 bg-yellow-50 text-rich-black-900 rounded-2xl font-bold text-sm shadow-[0_8px_30px_rgba(255,214,10,0.4)] hover:scale-105 transition-transform"
          >
            <FiCpu size={18} />
            Ask AI
          </motion.button>
        )}
      </AnimatePresence>

      {/* Slide-up Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-[420px] max-h-[600px] bg-[#000B1C] border border-rich-black-700 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden"
            style={{ backdropFilter: 'blur(20px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-rich-black-800 bg-gradient-to-r from-yellow-50/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-yellow-50/10 rounded-2xl flex items-center justify-center text-yellow-50">
                  <FiCpu size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">AI Study Assistant</p>
                  <p className="text-[10px] text-rich-black-400 truncate max-w-[220px]">
                    {currentVideo?.topic || 'Current Lesson'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-rich-black-800 rounded-xl transition-colors text-rich-black-400 hover:text-white"
              >
                <FiChevronDown size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar min-h-0" style={{ maxHeight: '380px' }}>
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  message={msg}
                  onSaveNote={msg.role === 'ai' ? handleSaveAsNote : null}
                />
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-50/10 text-yellow-50 flex items-center justify-center">
                    <FiCpu size={16} />
                  </div>
                  <div className="px-4 py-3 bg-rich-black-800/80 border border-rich-black-700 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 rounded-full bg-yellow-50/60"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions (shown when only greeting is visible) */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-rich-black-800 border border-rich-black-700 text-rich-black-300 hover:border-yellow-50/50 hover:text-yellow-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="px-4 py-4 border-t border-rich-black-800 bg-[#000814]">
              <div className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about this lesson…"
                  rows={1}
                  className="flex-1 bg-rich-black-800 border border-rich-black-700 rounded-2xl px-4 py-3 text-sm text-rich-black-50 placeholder:text-rich-black-500 focus:border-yellow-50/50 focus:ring-1 focus:ring-yellow-50/20 outline-none transition-all resize-none"
                  style={{ minHeight: '44px', maxHeight: '100px' }}
                  onInput={e => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-yellow-50 text-rich-black-900"
                >
                  {isLoading ? <FiLoader size={18} className="animate-spin" /> : <FiSend size={18} />}
                </motion.button>
              </div>
              <p className="text-[10px] text-rich-black-600 mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiSidebar;
