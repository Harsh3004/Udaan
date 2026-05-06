import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiX, FiMessageCircle, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { endpoints } from '../services/api';
import { request } from '../services/operations/authApi';
import socketService from '../services/socketService';

const InstructorChat = ({ courseId, courseTitle, instructor, isOpen, onClose }) => {
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [chatExists, setChatExists] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [messageMenuOpen, setMessageMenuOpen] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            checkChatExists();
            fetchMessages();
        }
    }, [isOpen, courseId, token]);

    useEffect(() => {
        if (isOpen && courseId) {
            socketService.joinCourseChat(courseId);

            const handleNewMessage = (data) => {
                if (data.courseId === courseId && data.senderId !== user?._id) {
                    fetchMessages();
                }
            };

            const handleMessageDeleted = (data) => {
                if (data.courseId === courseId) {
                    fetchMessages();
                }
            };

            if (socketService.socket) {
                socketService.socket.on('new_message', handleNewMessage);
                socketService.socket.on('message_deleted', handleMessageDeleted);
            }

            return () => {
                socketService.leaveCourseChat(courseId);
                if (socketService.socket) {
                    socketService.socket.off('new_message', handleNewMessage);
                    socketService.socket.off('message_deleted', handleMessageDeleted);
                }
            };
        }
    }, [isOpen, courseId, user?._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const checkChatExists = async () => {
        try {
            const res = await request(`${endpoints.CHAT_CHECK_EXISTS}/${courseId}`, 'GET', null, token);
            const data = await res.json();
            if (data.success) {
                setChatExists(data.exists);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error checking chat:', error);
        }
    };

    const fetchMessages = async () => {
        if (!courseId || !token) return;
        setIsLoading(true);
        try {
            const res = await request(`${endpoints.CHAT_GET_MESSAGES}/${courseId}`, 'GET', null, token);
            const data = await res.json();
            if (res.ok && data.success) {
                setMessages(data.chat?.messages || []);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        const messageContent = newMessage.trim();
        setNewMessage('');
        socketService.sendTypingIndicator(courseId, false);

        try {
            const res = await request(endpoints.CHAT_SEND_MESSAGE, 'POST', {
                courseId,
                content: messageContent
            }, token);

            const data = await res.json();
            if (data.success) {
                setMessages(prev => {
                    const lastMsg = data.chat?.messages?.[data.chat?.messages?.length - 1];
                    const exists = prev.some(m => m._id === lastMsg?._id);
                    if (exists) return prev;
                    return data.chat?.messages || [];
                });
                setChatExists(true);
            } else {
                toast.error(data.message || 'Failed to send message');
                setNewMessage(messageContent);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
            setNewMessage(messageContent);
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        if (courseId) {
            socketService.sendTypingIndicator(courseId, true);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                socketService.sendTypingIndicator(courseId, false);
            }, 2000);
        }
    };

    const deleteMessage = async (messageId) => {
        try {
            const res = await request(endpoints.CHAT_DELETE_MESSAGE, 'DELETE', {
                courseId,
                messageId
            }, token);

            const data = await res.json();
            if (data.success) {
                setMessages(data.chat?.messages || []);
                setMessageMenuOpen(null);
                toast.success('Message deleted');
            } else {
                toast.error(data.message || 'Failed to delete message');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Failed to delete message');
        }
    };

    const toggleMessageMenu = (messageId) => {
        setMessageMenuOpen(messageMenuOpen === messageId ? null : messageId);
    };

    // Helper to check if sender is current user
    const isMessageFromMe = (msg) => {
        const senderId = msg.sender?._id?.toString() || msg.sender?.toString() || msg.sender;
        const myId = user?._id?.toString() || user?._id || user?.id?.toString() || user?.id;
        return senderId === myId;
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date) => {
        const messageDate = new Date(date);
        const today = new Date();
        if (messageDate.toDateString() === today.toDateString()) {
            return 'Today';
        }
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const groupMessagesByDate = (msgs) => {
        const groups = {};
        msgs.forEach(msg => {
            const date = new Date(msg.createdAt).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
        });
        return groups;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70]"
            >
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed right-6 bottom-6 w-[420px] h-[600px] max-h-[calc(100vh-120px)] bg-gradient-to-br from-rich-black-900 via-rich-black-800 to-rich-black-900 rounded-3xl border border-rich-black-600 shadow-2xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="relative p-5 border-b border-rich-black-700 bg-gradient-to-r from-yellow-50/5 to-transparent">
                        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-yellow-50/10 via-transparent to-transparent" />

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={instructor?.profileImage}
                                        alt={instructor?.fName}
                                        onError={(e) => {
                                            e.target.src = `https://api.dicebear.com/7.x/initials/png?seed=${instructor?.fName || 'I'}&size=128`;
                                        }}
                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-yellow-50/30"
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-pastelGreen-500 rounded-full border-2 border-rich-black-800" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{instructor?.fName} {instructor?.lName}</h3>
                                    <p className="text-xs text-rich-black-400 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-pastelGreen-500 rounded-full animate-pulse" />
                                        Instructor · {courseTitle?.substring(0, 30)}...
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-rich-black-700/50 text-rich-black-300 hover:text-white hover:bg-rich-black-600 transition-all flex items-center justify-center"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="w-8 h-8 border-2 border-yellow-50 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-20 h-20 rounded-full bg-rich-black-800/50 flex items-center justify-center mb-4">
                                    <FiMessageCircle size={36} className="text-gray-500" />
                                </div>
                                <h4 className="text-gray-200 font-semibold mb-2">Start a Conversation</h4>
                                <p className="text-sm text-gray-400 max-w-xs">
                                    Have a doubt or issue? Send a message to your instructor and they'll respond as soon as possible.
                                </p>
                            </div>
                        ) : (
                            Object.entries(groupMessagesByDate(messages)).map(([date, msgs]) => (
                                <div key={date}>
                                    <div className="flex items-center gap-4 my-4">
                                        <div className="flex-1 h-px bg-rich-black-700" />
                                        <span className="text-xs text-gray-500 font-medium px-3 py-1 bg-rich-black-800/50 rounded-full">
                                            {formatDate(msgs[0].createdAt)}
                                        </span>
                                        <div className="flex-1 h-px bg-rich-black-700" />
                                    </div>
                                    {msgs.map((msg, idx) => {
                                        const isMyMessage = isMessageFromMe(msg);
                                        return (
                                            <div
                                                key={msg._id || idx}
                                                className={`flex mb-4 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[80%] flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                                    <div className="relative group">
                                                        <div className={`px-4 py-3 rounded-2xl max-w-full ${
                                                            isMyMessage
                                                                ? 'bg-yellow-50 text-rich-black-900 rounded-br-sm rounded-bl-lg'
                                                                : 'bg-rich-black-700 text-white rounded-bl-sm rounded-tr-lg'
                                                        }`}>
                                                            <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                                                        </div>
                                                        {isMyMessage && (
                                                            <button
                                                                onClick={() => toggleMessageMenu(msg._id)}
                                                                className="absolute -top-6 right-0 p-1.5 bg-rich-black-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rich-black-600"
                                                            >
                                                                <FiMoreVertical size={14} className="text-gray-400" />
                                                            </button>
                                                        )}
                                                        {messageMenuOpen === msg._id && isMyMessage && (
                                                            <div
                                                                className="absolute -top-12 right-0 bg-rich-black-700 border border-rich-black-600 rounded-xl shadow-xl overflow-hidden z-10"
                                                            >
                                                                <button
                                                                    onClick={() => deleteMessage(msg._id)}
                                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full"
                                                                >
                                                                    <FiTrash2 size={14} />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-500 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                                        <span>{formatTime(msg.createdAt)}</span>
                                                        {isMyMessage && (
                                                            msg.read ? (
                                                                <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                                                                </svg>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-rich-black-700 bg-rich-black-900/50">
                        <div className="flex items-end gap-3">
                            <div className="flex-1 relative">
                                <textarea
                                    ref={inputRef}
                                    value={newMessage}
                                    onChange={handleInputChange}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    rows={1}
                                    className="w-full bg-rich-black-800/80 border border-rich-black-600 rounded-2xl px-4 py-3 pr-12 text-sm text-rich-black-50 placeholder:text-rich-black-400 focus:border-yellow-50/50 focus:ring-1 focus:ring-yellow-50/20 outline-none transition-all resize-none max-h-32"
                                    style={{
                                        height: 'auto',
                                        minHeight: '48px',
                                        maxHeight: '120px'
                                    }}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                    }}
                                />
                            </div>
                            <motion.button
                                onClick={sendMessage}
                                disabled={!newMessage.trim() || isSending}
                                whileHover={newMessage.trim() && !isSending ? { scale: 1.05 } : {}}
                                whileTap={newMessage.trim() && !isSending ? { scale: 0.95 } : {}}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                    newMessage.trim() && !isSending
                                        ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-rich-black-900 shadow-[0_4px_15px_rgba(255,214,10,0.3)] hover:shadow-[0_6px_20px_rgba(255,214,10,0.4)]'
                                        : 'bg-rich-black-700 text-rich-black-500 cursor-not-allowed'
                                }`}
                            >
                                {isSending ? (
                                    <div className="w-5 h-5 border-2 border-rich-black-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <FaPaperPlane size={18} className={newMessage.trim() ? '' : 'opacity-50'} />
                                )}
                            </motion.button>
                        </div>
                        <p className="text-xs text-rich-black-500 mt-2 text-center">
                            Responses typically within 24 hours
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InstructorChat;