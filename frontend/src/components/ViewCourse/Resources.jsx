import React, { useState, useEffect, useRef } from 'react';
import { FiDownload, FiTrash2, FiUpload, FiFileText, FiX, FiFile, FiImage, FiFilm, FiMusic, FiEye } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { endpoints } from '../../services/api';
import { request } from '../../services/operations/authApi';
import { Modal } from '../Modal';

const Resources = ({ courseId, token, user, isInstructor }) => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewResource, setPreviewResource] = useState(null);
    const [previewError, setPreviewError] = useState(false);
    const [uploadData, setUploadData] = useState({
        title: '',
        description: '',
        file: null
    });
    const fileInputRef = useRef(null);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const res = await request(`${endpoints.RESOURCE_GET}/${courseId}`, 'GET', null, token);
            const data = await res.json();
            if (data.success) {
                setResources(data.resources || []);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId && token) {
            fetchResources();
        }
    }, [courseId, token]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadData(prev => ({ ...prev, file, title: file.name.replace(/\.[^/.]+$/, '') }));
        }
    };

    const handleUpload = async () => {
        if (!uploadData.title.trim() || !uploadData.file) {
            toast.error('Title and file are required');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('courseId', courseId);
            formData.append('title', uploadData.title.trim());
            formData.append('description', uploadData.description.trim());
            formData.append('file', uploadData.file);

            const res = await fetch(endpoints.RESOURCE_UPLOAD, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                setResources(prev => [data.resource, ...prev]);
                setShowUploadModal(false);
                setUploadData({ title: '', description: '', file: null });
                toast.success('Resource uploaded successfully');
            } else {
                toast.error(data.message || 'Failed to upload resource');
            }
        } catch (error) {
            toast.error('Error uploading resource');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteClick = (resourceId) => {
        setResourceToDelete(resourceId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!resourceToDelete) return;

        try {
            const res = await request(`${endpoints.RESOURCE_DELETE}/${resourceToDelete}`, 'DELETE', null, token);
            const data = await res.json();

            if (data.success) {
                setResources(prev => prev.filter(r => r._id !== resourceToDelete));
                toast.success('Resource deleted');
            } else {
                toast.error(data.message || 'Failed to delete');
            }
        } catch (error) {
            toast.error('Error deleting resource');
        } finally {
            setShowDeleteModal(false);
            setResourceToDelete(null);
        }
    };

    const handlePreview = (resource) => {
        setPreviewError(false);
        setPreviewResource(resource);
        setShowPreviewModal(true);
        fetch(`${endpoints.RESOURCE_DOWNLOADS}/${resource._id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(() => {});
    };

    const getPreviewContent = () => {
        if (!previewResource) return null;

        const fileType = previewResource.fileType;
        const fileUrl = previewResource.file.url;

        if (fileType.includes('image')) {
            return (
                <div className="flex flex-col items-center">
                    <img
                        src={fileUrl}
                        alt={previewResource.title}
                        className="max-w-full max-h-[60vh] object-contain rounded-lg"
                        onError={() => setPreviewError(true)}
                    />
                    <p className="text-sm text-rich-black-400 mt-4">{previewResource.fileName}</p>
                </div>
            );
        }

        if (fileType.includes('video')) {
            return (
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                        src={fileUrl}
                        controls
                        className="w-full h-full object-contain"
                        onError={() => setPreviewError(true)}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }

        if (fileType.includes('audio')) {
            return (
                <div className="flex flex-col items-center py-8">
                    <div className="w-20 h-20 bg-yellow-50/10 rounded-full flex items-center justify-center mb-4">
                        <FiMusic size={40} className="text-yellow-50" />
                    </div>
                    <audio
                        src={fileUrl}
                        controls
                        className="w-full max-w-md"
                        onError={() => setPreviewError(true)}
                    />
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center py-8">
                <div className={`w-20 h-20 rounded-xl flex items-center justify-center mb-4 ${getFileColor(fileType)}`}>
                    {getFileIcon(fileType)}
                </div>
                <p className="text-rich-black-200 mb-2">{fileType.split('/')[1]?.toUpperCase() || 'FILE'}</p>
                <p className="text-sm text-rich-black-500 mb-6">Preview is not available for this file type</p>
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-50 text-rich-black-900 font-bold rounded-xl hover:scale-105 transition-transform"
                >
                    <FiDownload size={18} />
                    Download to View
                </a>
            </div>
        );
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (fileType) => {
        if (fileType.includes('image')) return <FiImage size={20} />;
        if (fileType.includes('video')) return <FiFilm size={20} />;
        if (fileType.includes('audio')) return <FiMusic size={20} />;
        if (fileType.includes('pdf')) return <FiFileText size={20} />;
        return <FiFile size={20} />;
    };

    const getFileColor = (fileType) => {
        if (fileType.includes('image')) return 'text-purple-400 bg-purple-400/10';
        if (fileType.includes('video')) return 'text-red-400 bg-red-400/10';
        if (fileType.includes('audio')) return 'text-green-400 bg-green-400/10';
        if (fileType.includes('pdf')) return 'text-red-500 bg-red-500/10';
        if (fileType.includes('word') || fileType.includes('document')) return 'text-blue-400 bg-blue-400/10';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'text-green-400 bg-green-400/10';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'text-orange-400 bg-orange-400/10';
        return 'text-gray-400 bg-gray-400/10';
    };

    return (
        <div className="space-y-6">
            {isInstructor && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-yellow-50 text-rich-black-900 font-bold rounded-xl hover:scale-105 transition-transform"
                    >
                        <FiUpload size={18} />
                        Upload Resource
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-yellow-50 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : resources.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rich-black-800/50 flex items-center justify-center">
                        <FiFileText size={24} className="text-rich-black-500" />
                    </div>
                    <p className="text-rich-black-300 font-medium">No resources available</p>
                    <p className="text-sm text-rich-black-500">
                        {isInstructor ? 'Upload resources for your students' : 'Instructor has not uploaded any resources yet'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.map(resource => (
                        <motion.div
                            key={resource._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-5 bg-rich-black-800/40 border border-rich-black-700 rounded-2xl group hover:border-yellow-50/50 transition-all"
                        >
                            <div
                                className="flex items-center gap-4 cursor-pointer flex-1 min-w-0"
                                onClick={() => handlePreview(resource)}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getFileColor(resource.fileType)}`}>
                                    {getFileIcon(resource.fileType)}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-sm font-semibold text-rich-black-50 truncate" title={resource.title}>
                                        {resource.title}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-rich-black-400">
                                        <span>{formatFileSize(resource.fileSize)}</span>
                                        <span>•</span>
                                        <span>{resource.downloads || 0} views</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                <button
                                    onClick={() => handlePreview(resource)}
                                    className="p-2 text-rich-black-400 hover:text-yellow-50 transition-colors"
                                    title="View"
                                >
                                    <FiEye size={18} />
                                </button>
                                {isInstructor && (
                                    <button
                                        onClick={() => handleDeleteClick(resource._id)}
                                        className="p-2 text-rich-black-400 hover:text-red-400 transition-colors"
                                        title="Delete"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Resource"
            >
                Are you sure you want to delete this resource? This action cannot be undone.
            </Modal>

            {/* File Preview Modal */}
            <AnimatePresence>
                {showPreviewModal && previewResource && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPreviewModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-rich-black-800 border border-rich-black-700 rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{previewResource.title}</h3>
                                    {previewResource.description && (
                                        <p className="text-sm text-rich-black-400 mt-1">{previewResource.description}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowPreviewModal(false)}
                                    className="p-2 hover:bg-rich-black-700 rounded-xl transition-colors text-rich-black-400 hover:text-white"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {previewError ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mb-4">
                                            <FiX size={32} />
                                        </div>
                                        <p className="text-rich-black-300 mb-2">Failed to load preview</p>
                                        <p className="text-sm text-rich-black-500 mb-6">The file might be temporarily unavailable or the format is not supported for preview.</p>
                                        <a
                                            href={previewResource?.file?.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-6 py-3 bg-yellow-50 text-rich-black-900 font-bold rounded-xl hover:scale-105 transition-transform"
                                        >
                                            <FiDownload size={18} />
                                            Download File
                                        </a>
                                    </div>
                                ) : (
                                    getPreviewContent()
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowUploadModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-rich-black-800 border border-rich-black-700 rounded-3xl p-8 w-full max-w-lg"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Upload Resource</h3>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="p-2 hover:bg-rich-black-700 rounded-xl transition-colors text-rich-black-400 hover:text-white"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-rich-black-200 mb-2">
                                        Resource Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadData.title}
                                        onChange={e => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Enter resource title"
                                        className="w-full bg-rich-black-900 border border-rich-black-700 rounded-xl px-4 py-3 text-sm text-rich-black-50 focus:border-yellow-50 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-rich-black-200 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={uploadData.description}
                                        onChange={e => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Optional description"
                                        className="w-full bg-rich-black-900 border border-rich-black-700 rounded-xl px-4 py-3 text-sm text-rich-black-50 focus:border-yellow-50 outline-none resize-none"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-rich-black-200 mb-2">
                                        File *
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-rich-black-600 rounded-2xl p-8 text-center cursor-pointer hover:border-yellow-50/50 transition-colors"
                                    >
                                        {uploadData.file ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-10 h-10 bg-yellow-50/10 text-yellow-50 rounded-lg flex items-center justify-center">
                                                    <FiFile size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-white">{uploadData.file.name}</p>
                                                    <p className="text-xs text-rich-black-400">{formatFileSize(uploadData.file.size)}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 mx-auto mb-3 bg-rich-black-700 rounded-xl flex items-center justify-center">
                                                    <FiUpload size={24} className="text-rich-black-400" />
                                                </div>
                                                <p className="text-sm text-rich-black-300">Click to select a file</p>
                                                <p className="text-xs text-rich-black-500 mt-1">PDF, DOC, PPT, XLS, Images, Videos, ZIP (max 500MB)</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1 py-3 bg-rich-black-700 text-rich-black-200 font-medium rounded-xl hover:bg-rich-black-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading || !uploadData.title.trim() || !uploadData.file}
                                    className="flex-1 py-3 bg-yellow-50 text-rich-black-900 font-bold rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Resources;