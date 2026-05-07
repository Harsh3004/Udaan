import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiSearch, FiArrowLeft, FiTrash2, FiMoreVertical, FiX } from 'react-icons/fi';
import { FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { endpoints } from '../services/api';
import { request } from '../services/operations/authApi';
import socketService from '../services/socketService';

const Messages = () => {
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    void motion;

    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [messageMenuOpen, setMessageMenuOpen] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const currentCourseIdRef = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (token && user?._id) {
            socketService.connect(token);
        }
    }, [token, user?._id]);

    useEffect(() => {
        fetchConversations();
    }, [token, user]);

    useEffect(() => {
        if (selectedChat && token) {
            const courseId = selectedChat.course._id;
            currentCourseIdRef.current = courseId;

            fetchMessages(courseId);
            socketService.joinCourseChat(courseId);
            markMessagesAsRead(courseId);

            const handleNewMessage = (data) => {
                if (data.courseId === currentCourseIdRef.current) {
                    const newMsg = data.message;
                    if (newMsg && newMsg._id) {
                        setMessages(prev => {
                            const exists = prev.some(m => m._id === newMsg._id);
                            if (exists) return prev;
                            return [...prev, newMsg];
                        });
                    }
                    if (data.message?.sender?._id !== user?._id) {
                        scrollToBottom();
                    }
                }
            };

            const handleMessageDeleted = (data) => {
                if (data.courseId === currentCourseIdRef.current && data.messageId) {
                    setMessages(prev => prev.filter(m => m._id !== data.messageId));
                }
            };

            const handleMessagesRead = (data) => {
                if (data.courseId === currentCourseIdRef.current) {
                    setMessages(prev => prev.map(m => ({ ...m, read: true })));
                }
            };

            if (socketService.socket) {
                socketService.socket.on('new_message', handleNewMessage);
                socketService.socket.on('message_deleted', handleMessageDeleted);
                socketService.socket.on('messages_read', handleMessagesRead);
            }

            return () => {
                socketService.leaveCourseChat(courseId);
                if (socketService.socket) {
                    socketService.socket.off('new_message', handleNewMessage);
                    socketService.socket.off('message_deleted', handleMessageDeleted);
                    socketService.socket.off('messages_read', handleMessagesRead);
                }
            };
        }
    }, [selectedChat, token, user?._id]);

    const markMessagesAsRead = async (courseId) => {
        try {
            await request(`${endpoints.CHAT_MARK_READ}/${courseId}`, 'PUT', null, token);
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        if (!token || !user) return;
        setIsLoading(true);
        try {
            const endpoint = user.role === 'Instructor'
                ? endpoints.CHAT_INSTRUCTOR_CONVERSATIONS
                : endpoints.CHAT_STUDENT_CONVERSATIONS;
            const res = await request(endpoint, 'GET', null, token);
            const data = await res.json();
            if (data.success) {
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (courseId) => {
        if (!courseId || !token) return;
        try {
            const res = await request(`${endpoints.CHAT_GET_MESSAGES}/${courseId}`, 'GET', null, token);
            const data = await res.json();
            if (data.success) {
                setMessages(data.chat?.messages || []);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat || isSending) return;

        setIsSending(true);
        const messageContent = newMessage.trim();
        const tempId = `temp_${Date.now()}`;
        const optimisticMessage = {
            _id: tempId,
            content: messageContent,
            sender: user,
            createdAt: new Date(),
            read: false,
            isOptimistic: true
        };

        setNewMessage('');
        setMessages(prev => [...prev, optimisticMessage]);
        socketService.sendTypingIndicator(selectedChat.course._id, false);
        scrollToBottom();

        try {
            const res = await request(endpoints.CHAT_SEND_MESSAGE, 'POST', {
                courseId: selectedChat.course._id,
                content: messageContent
            }, token);

            const data = await res.json();
            if (data.success && data.chat?.messages) {
                const lastMsg = data.chat.messages[data.chat.messages.length - 1];
                setMessages(prev => {
                    const filtered = prev.filter(m => m._id !== tempId);
                    if (lastMsg && !filtered.some(m => m._id === lastMsg._id)) {
                        return [...filtered, lastMsg];
                    }
                    return filtered;
                });
                fetchConversations();
            } else {
                toast.error(data.message || 'Failed to send message');
                setMessages(prev => prev.filter(m => m._id !== tempId));
                setNewMessage(messageContent);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
            setMessages(prev => prev.filter(m => m._id !== tempId));
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
        if (selectedChat) {
            socketService.sendTypingIndicator(selectedChat.course._id, true);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                socketService.sendTypingIndicator(selectedChat.course._id, false);
            }, 2000);
        }
    };

    const deleteMessage = async (messageId) => {
        const previousMessages = messages;
        setMessages(prev => prev.filter(m => m._id !== messageId));
        setMessageMenuOpen(null);

        try {
            const res = await request(endpoints.CHAT_DELETE_MESSAGE, 'DELETE', {
                courseId: selectedChat.course._id,
                messageId
            }, token);

            const data = await res.json();
            if (!data.success) {
                toast.error(data.message || 'Failed to delete message');
                setMessages(previousMessages);
            } else {
                toast.success('Message deleted');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Failed to delete message');
            setMessages(previousMessages);
        }
    };

    const deleteChat = async () => {
        if (!selectedChat) return;
        try {
            const res = await request(
                `${endpoints.CHAT_DELETE}/${selectedChat.course._id}`,
                'DELETE',
                null,
                token
            );
            const data = await res.json();
            if (data.success) {
                toast.success('Conversation deleted');
                setSelectedChat(null);
                fetchConversations();
                setShowDeleteConfirm(false);
            } else {
                toast.error(data.message || 'Failed to delete conversation');
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
            toast.error('Failed to delete conversation');
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

    const getOtherUser = (chat) => {
        return user.role === 'Instructor' ? chat.student : chat.instructor;
    };

    const getUnreadCount = (chat) => {
        return user.role === 'Instructor' ? chat.instructorUnreadCount : chat.studentUnreadCount;
    };

    const filteredConversations = conversations.filter(conv => {
        const otherUser = getOtherUser(conv);
        const courseName = conv.course?.title?.toLowerCase() || '';
        const userName = `${otherUser?.fName || ''} ${otherUser?.lName || ''}`.toLowerCase();
        const query = searchQuery.toLowerCase();
        return courseName.includes(query) || userName.includes(query);
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-rich-black-900 flex items-center justify-center">
                <div className="w-12 h-12 border-3 border-yellow-50 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-rich-black-900 flex">
            {/* Left Sidebar - Conversations List */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${selectedChat ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-96 bg-rich-black-800 border-r border-rich-black-700`}
            >
                {/* Header */}
                <div className="p-6 border-b border-rich-black-700">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <FiMessageCircle className="text-yellow-50" />
                            Messages
                        </h1>
                    </div>
                    <div className="relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-rich-black-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search conversations..."
                            className="w-full bg-rich-black-900/50 border border-rich-black-600 rounded-xl pl-11 pr-4 py-2.5 text-sm text-rich-black-50 placeholder:text-rich-black-400 focus:border-yellow-50/50 focus:ring-1 focus:ring-yellow-50/20 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6">
                            <div className="w-16 h-16 rounded-full bg-rich-black-700/50 flex items-center justify-center mb-4">
                                <FiMessageCircle size={28} className="text-rich-black-500" />
                            </div>
                            <p className="text-rich-black-300 font-medium mb-1">No conversations yet</p>
                            <p className="text-sm text-rich-black-500">
                                {user.role === 'Instructor'
                                    ? 'Students will message you here'
                                    : 'Start a chat with your instructor from your course page'}
                            </p>
                        </div>
                    ) : (
                        filteredConversations.map((chat) => {
                            const otherUser = getOtherUser(chat);
                            const unread = getUnreadCount(chat);
                            return (
                                <div
                                    key={chat._id}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`flex items-center gap-4 p-4 cursor-pointer border-b border-rich-black-700/50 transition-all hover:bg-rich-black-700/50 ${
                                        selectedChat?._id === chat._id ? 'bg-yellow-50/5 border-l-2 border-l-yellow-50' : ''
                                    }`}
                                >
                                    <div className="relative">
                                        <img
                                            src={otherUser?.profileImage}
                                            alt={otherUser?.fName}
                                            onError={(e) => {
                                                e.target.src = `https://api.dicebear.com/7.x/initials/png?seed=${otherUser?.fName || 'U'}&size=128`;
                                            }}
                                            className={`w-12 h-12 rounded-full object-cover ${unread > 0 ? 'ring-2 ring-yellow-50' : 'ring-1 ring-rich-black-600'}`}
                                        />
                                        {unread > 0 && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-50 text-rich-black-900 text-xs font-bold rounded-full flex items-center justify-center">
                                                {unread > 9 ? '9+' : unread}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className={`font-semibold truncate ${unread > 0 ? 'text-white' : 'text-gray-200'}`}>
                                                {otherUser?.fName} {otherUser?.lName}
                                            </p>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(chat.lastMessageAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 truncate mb-1">
                                            {chat.course?.title}
                                        </p>
                                        {chat.lastMessage && (
                                            <p className={`text-xs truncate ${unread > 0 ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                                                {chat.lastMessage}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </motion.div>

            {/* Right Side - Chat Area */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${selectedChat ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-rich-black-900`}
            >
                {!selectedChat ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 rounded-full bg-rich-black-800/50 flex items-center justify-center mb-6">
                            <FiMessageCircle size={48} className="text-rich-black-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-rich-black-200 mb-2">Select a conversation</h2>
                        <p className="text-rich-black-500 max-w-sm">
                            Choose a conversation from the list to start messaging
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-5 border-b border-rich-black-700 bg-rich-black-800/50">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSelectedChat(null)}
                                    className="lg:hidden p-2 text-rich-black-300 hover:text-white"
                                >
                                    <FiArrowLeft size={20} />
                                </button>
                                <img
                                    src={getOtherUser(selectedChat)?.profileImage}
                                    alt={getOtherUser(selectedChat)?.fName}
                                    onError={(e) => {
                                        e.target.src = `https://api.dicebear.com/7.x/initials/png?seed=${getOtherUser(selectedChat)?.fName || 'U'}&size=128`;
                                    }}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-rich-black-600"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold text-white">
                                        {getOtherUser(selectedChat)?.fName} {getOtherUser(selectedChat)?.lName}
                                    </p>
                                    <p className="text-xs text-rich-black-400">
                                        {selectedChat.course?.title}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    user.role === 'Instructor'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}>
                                    {user.role === 'Instructor' ? 'Student' : 'Instructor'}
                                </span>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Delete conversation"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Delete Chat Confirmation Modal */}
                        <AnimatePresence>
                            {showDeleteConfirm && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
                                        onClick={() => setShowDeleteConfirm(false)}
                                    />
                                    <div className="fixed inset-0 z-[81] flex items-center justify-center p-4">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                            className="w-full max-w-sm"
                                        >
                                            <div className="bg-rich-black-800 border border-rich-black-600 rounded-2xl p-6 shadow-2xl">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                                        <FiTrash2 className="text-red-400" size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">Delete Conversation</h3>
                                                        <p className="text-sm text-gray-400">This action cannot be undone</p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-300 mb-6">
                                                    Are you sure you want to delete this entire conversation? All messages will be permanently removed.
                                                </p>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => setShowDeleteConfirm(false)}
                                                        className="flex-1 px-4 py-2.5 bg-rich-black-700 text-gray-200 rounded-xl font-medium hover:bg-rich-black-600 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={deleteChat}
                                                        className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </>
                            )}
                        </AnimatePresence>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                            {Object.entries(groupMessagesByDate(messages)).map(([date, msgs]) => (
                                <div key={date}>
                                    <div className="flex items-center gap-4 my-4">
                                        <div className="flex-1 h-px bg-rich-black-700" />
                                        <span className="text-xs text-rich-black-500 font-medium px-3 py-1 bg-rich-black-800/50 rounded-full">
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
                                                <div className={`max-w-[75%] flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
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
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-5 border-t border-rich-black-700 bg-rich-black-800/30">
                            <div className="flex items-end gap-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={inputRef}
                                        value={newMessage}
                                        onChange={handleInputChange}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your message..."
                                        rows={1}
                                        className="w-full bg-rich-black-800/80 border border-rich-black-600 rounded-2xl px-5 py-3.5 pr-14 text-sm text-rich-black-50 placeholder:text-rich-black-400 focus:border-yellow-50/50 focus:ring-1 focus:ring-yellow-50/20 outline-none transition-all resize-none max-h-32"
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
                                        <FaPaperPlane size={18} />
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default Messages;