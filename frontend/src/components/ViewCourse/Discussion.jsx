import React, { useState, useEffect } from 'react';
import { FiSend, FiEdit2, FiTrash2, FiMessageSquare, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { endpoints } from '../../services/api';
import { request } from '../../services/operations/authApi';

const Discussion = ({ courseId, token, user }) => {
    const [discussions, setDiscussions] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [expandedReplies, setExpandedReplies] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');

    const fetchDiscussions = async () => {
        setLoading(true);
        try {
            const res = await request(`${endpoints.DISCUSSION_GET}/${courseId}`, 'GET', null, token);
            const data = await res.json();
            if (data.success) {
                setDiscussions(data.discussions || []);
            }
        } catch (error) {
            console.error('Error fetching discussions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId && token) {
            fetchDiscussions();
        }
    }, [courseId, token]);

    const handlePost = async () => {
        if (!newPost.trim()) return;

        setPosting(true);
        try {
            const res = await request(endpoints.DISCUSSION_CREATE, 'POST', {
                courseId,
                content: newPost.trim()
            }, token);
            const data = await res.json();

            if (data.success) {
                setDiscussions(prev => [data.discussion, ...prev]);
                setNewPost('');
                toast.success('Posted successfully');
            } else {
                toast.error(data.message || 'Failed to post');
            }
        } catch (error) {
            toast.error('Error posting discussion');
        } finally {
            setPosting(false);
        }
    };

    const handleReply = async (parentId) => {
        if (!replyContent.trim()) return;

        setPosting(true);
        try {
            const res = await request(endpoints.DISCUSSION_CREATE, 'POST', {
                courseId,
                content: replyContent.trim(),
                parentReplyId: parentId
            }, token);
            const data = await res.json();

            if (data.success) {
                setDiscussions(prev => prev.map(d => {
                    if (d._id === parentId) {
                        return {
                            ...d,
                            replies: [...(d.replies || []), data.discussion]
                        };
                    }
                    return d;
                }));
                setReplyingTo(null);
                setReplyContent('');
                toast.success('Reply posted');
            } else {
                toast.error(data.message || 'Failed to reply');
            }
        } catch (error) {
            toast.error('Error posting reply');
        } finally {
            setPosting(false);
        }
    };

    const handleDelete = async (discussionId) => {
        if (!window.confirm('Delete this discussion?')) return;

        try {
            const res = await request(`${endpoints.DISCUSSION_DELETE}/${discussionId}`, 'DELETE', null, token);
            const data = await res.json();

            if (data.success) {
                setDiscussions(prev => prev.filter(d => d._id !== discussionId && !d.replies?.some(r => r._id === discussionId)));
                toast.success('Deleted successfully');
            } else {
                toast.error(data.message || 'Failed to delete');
            }
        } catch (error) {
            toast.error('Error deleting discussion');
        }
    };

    const handleEdit = async (discussionId) => {
        if (!editContent.trim()) return;

        try {
            const res = await request(`${endpoints.DISCUSSION_UPDATE}/${discussionId}`, 'PUT', {
                content: editContent.trim()
            }, token);
            const data = await res.json();

            if (data.success) {
                setDiscussions(prev => prev.map(d => {
                    if (d._id === discussionId) {
                        return { ...d, content: editContent.trim(), updatedAt: new Date() };
                    }
                    return d;
                }));
                setEditingId(null);
                setEditContent('');
                toast.success('Updated successfully');
            } else {
                toast.error(data.message || 'Failed to update');
            }
        } catch (error) {
            toast.error('Error updating discussion');
        }
    };

    const toggleReplies = (id) => {
        setExpandedReplies(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const DiscussionItem = ({ discussion, isReply = false }) => {
        const isOwner = user?.id === discussion.user?._id || user?.id === discussion.user;
        const isEditing = editingId === discussion._id;

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${isReply ? 'ml-8 border-l-2 border-yellow-50/20 pl-4' : ''}`}
            >
                <div className="flex gap-3">
                    <img
                        src={discussion.user?.profileImage}
                        alt={discussion.user?.fName}
                        onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/initials/png?seed=${discussion.user?.fName || 'U'}&size=128`;
                        }}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white">
                                {discussion.user?.fName} {discussion.user?.lName}
                            </span>
                            {discussion.user?.role === 'Instructor' && (
                                <span className="text-[10px] font-bold bg-yellow-50/20 text-yellow-50 px-2 py-0.5 rounded-full">
                                    INSTRUCTOR
                                </span>
                            )}
                            <span className="text-xs text-rich-black-500">{formatDate(discussion.createdAt)}</span>
                        </div>

                        {isEditing ? (
                            <div className="mt-2 space-y-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full bg-rich-black-800 border border-rich-black-700 rounded-xl p-3 text-sm text-rich-black-50 focus:border-yellow-50 outline-none resize-none"
                                    rows={3}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(discussion._id)}
                                        className="px-4 py-2 bg-yellow-50 text-rich-black-900 text-xs font-bold rounded-lg"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="px-4 py-2 bg-rich-black-700 text-rich-black-200 text-xs font-medium rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-1 text-sm text-rich-black-200 leading-relaxed">{discussion.content}</p>
                        )}

                        {!isReply && !isEditing && (
                            <div className="flex items-center gap-4 mt-2">
                                <button
                                    onClick={() => setReplyingTo(replyingTo === discussion._id ? null : discussion._id)}
                                    className="text-xs text-rich-black-400 hover:text-yellow-50 transition-colors flex items-center gap-1"
                                >
                                    <FiMessageSquare size={12} /> Reply
                                </button>
                                {isOwner && (
                                    <>
                                        <button
                                            onClick={() => {
                                                setEditingId(discussion._id);
                                                setEditContent(discussion.content);
                                            }}
                                            className="text-xs text-rich-black-400 hover:text-yellow-50 transition-colors flex items-center gap-1"
                                        >
                                            <FiEdit2 size={12} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(discussion._id)}
                                            className="text-xs text-rich-black-400 hover:text-red-400 transition-colors flex items-center gap-1"
                                        >
                                            <FiTrash2 size={12} /> Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {replyingTo === discussion._id && (
                            <div className="mt-3 space-y-2">
                                <textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Write your reply..."
                                    className="w-full bg-rich-black-800 border border-rich-black-700 rounded-xl p-3 text-sm text-rich-black-50 focus:border-yellow-50 outline-none resize-none"
                                    rows={2}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleReply(discussion._id)}
                                        disabled={posting}
                                        className="px-4 py-2 bg-yellow-50 text-rich-black-900 text-xs font-bold rounded-lg disabled:opacity-50"
                                    >
                                        {posting ? 'Posting...' : 'Post Reply'}
                                    </button>
                                    <button
                                        onClick={() => setReplyingTo(null)}
                                        className="px-4 py-2 bg-rich-black-700 text-rich-black-200 text-xs font-medium rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {!isReply && discussion.replies?.length > 0 && (
                            <button
                                onClick={() => toggleReplies(discussion._id)}
                                className="mt-3 text-xs text-yellow-50 hover:text-yellow-100 flex items-center gap-1"
                            >
                                {expandedReplies[discussion._id] ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                                {discussion.replies.length} {discussion.replies.length === 1 ? 'reply' : 'replies'}
                            </button>
                        )}

                        <AnimatePresence>
                            {!isReply && expandedReplies[discussion._id] && discussion.replies?.length > 0 && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-3 space-y-3 overflow-hidden"
                                >
                                    {discussion.replies.map(reply => (
                                        <DiscussionItem key={reply._id} discussion={reply} isReply />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-6">
            {!loading && (
                <div className="flex items-start gap-3">
                    <img
                        src={user?.profileImage}
                        alt={user?.fName}
                        onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/initials/png?seed=${user?.fName || 'U'}&size=128`;
                        }}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                        <textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder="Ask a question or start a discussion..."
                            className="w-full bg-rich-black-800 border border-rich-black-700 rounded-2xl p-4 text-sm text-rich-black-50 focus:border-yellow-50 outline-none resize-none placeholder:text-rich-black-400"
                            rows={3}
                        />
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={handlePost}
                                disabled={!newPost.trim() || posting}
                                className="flex items-center gap-2 px-6 py-3 bg-yellow-50 text-rich-black-900 font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiSend size={16} />
                                {posting ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-yellow-50 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : discussions.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rich-black-800/50 flex items-center justify-center">
                        <FiMessageSquare size={24} className="text-rich-black-500" />
                    </div>
                    <p className="text-rich-black-300 font-medium">No discussions yet</p>
                    <p className="text-sm text-rich-black-500">Be the first to start a discussion!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {discussions.map(discussion => (
                        <DiscussionItem key={discussion._id} discussion={discussion} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Discussion;