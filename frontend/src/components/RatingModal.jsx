import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { FiSend, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { endpoints } from '../services/api';
import { request } from '../services/operations/authApi';

const RatingModal = ({ isOpen, onClose, courseId, courseName, onReviewSubmitted }) => {
    const { token } = useSelector((state) => state.auth);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [animateStar, setAnimateStar] = useState(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (isOpen && textareaRef.current) {
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setRating(0);
            setHover(0);
            setReview('');
            setAnimateStar(null);
        }
    }, [isOpen]);

    const handleStarClick = (star) => {
        setRating(star);
        setAnimateStar(star);
        setTimeout(() => setAnimateStar(null), 300);
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Submitting your review...');

        try {
            const res = await request(
                `${endpoints.GET_COURSE_DETAILS_API}/${courseId}/rating/create`,
                'POST',
                { rating, review },
                token
            );

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success('Review submitted successfully!');
                onReviewSubmitted();
                onClose();
            } else {
                toast.error(data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            toast.dismiss(toastId);
            setIsSubmitting(false);
        }
    };

    const ratingLabels = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />

                    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="w-full max-w-xl mt-8 mb-8"
                        >
                        <div className="bg-gradient-to-br from-rich-black-800 via-rich-black-900 to-rich-black-800 rounded-3xl border border-rich-black-600 overflow-hidden shadow-2xl">
                            <div className="relative">
                                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-yellow-50/10 via-transparent to-transparent" />
                                <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-50/5 rounded-full blur-3xl" />

                                <div className="relative p-8 pb-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-1">Rate this Course</h2>
                                            {courseName && (
                                                <p className="text-rich-black-400 text-sm truncate max-w-xs">{courseName}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="w-10 h-10 rounded-full bg-rich-black-700/50 text-rich-black-300 hover:text-white hover:bg-rich-black-600 transition-all flex items-center justify-center"
                                        >
                                            <FiX size={20} />
                                        </button>
                                    </div>

                                    <div className="flex flex-col items-center py-6">
                                        <p className="text-rich-black-300 text-sm mb-5">How would you rate this course?</p>

                                        <div className="flex gap-3 mb-4">
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const isActive = star <= (hover || rating);
                                                const isAnimating = animateStar === star;

                                                return (
                                                    <motion.button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => handleStarClick(star)}
                                                        onMouseEnter={() => setHover(star)}
                                                        onMouseLeave={() => setHover(0)}
                                                        whileHover={{ scale: 1.15 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="relative focus:outline-none"
                                                    >
                                                        <motion.div
                                                            animate={isAnimating ? {
                                                                scale: [1, 1.4, 1],
                                                                rotate: [0, 15, -15, 0]
                                                            } : {}}
                                                            transition={{ duration: 0.4 }}
                                                        >
                                                            <FaStar
                                                                size={40}
                                                                className={`${isActive
                                                                    ? 'fill-yellow-50 text-yellow-50 drop-shadow-[0_0_8px_rgba(255,214,10,0.6)]'
                                                                    : 'fill-rich-black-700 text-rich-black-600'
                                                                    } transition-all duration-200`}
                                                            />
                                                        </motion.div>

                                                        {isActive && hover === star && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="absolute -top-8 left-1/2 -translate-x-1/2 bg-rich-black-700 text-xs text-white px-2 py-1 rounded whitespace-nowrap"
                                                            >
                                                                {ratingLabels[star]}
                                                            </motion.div>
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                        </div>

                                        <motion.p
                                            key={rating}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`text-lg font-semibold ${rating > 0
                                                ? rating >= 4 ? 'text-pastelGreen-400' : rating >= 3 ? 'text-yellow-50' : 'text-orange-400'
                                                : 'text-rich-black-400'
                                                }`}
                                        >
                                            {rating > 0 ? ratingLabels[rating] : 'Select a rating'}
                                        </motion.p>

                                        {rating > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                className="flex items-center gap-1 mt-2"
                                            >
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1.5 rounded-full transition-all duration-300 ${i < rating
                                                            ? 'bg-yellow-50 w-6'
                                                            : 'bg-rich-black-700 w-4'
                                                            }`}
                                                    />
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm text-rich-black-200 font-medium flex items-center justify-between">
                                            <span>Write a Review</span>
                                            <span className={`text-xs ${review.length > 450 ? 'text-orange-400' : 'text-rich-black-400'}`}>
                                                {review.length}/500
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                ref={textareaRef}
                                                value={review}
                                                onChange={(e) => setReview(e.target.value.slice(0, 500))}
                                                placeholder="Share your experience... What did you learn? Would you recommend this course?"
                                                className="w-full h-36 bg-rich-black-900/80 border border-rich-black-600 rounded-2xl p-4 pr-12 text-rich-black-50 placeholder:text-rich-black-500 focus:border-yellow-50/50 focus:ring-2 focus:ring-yellow-50/20 outline-none transition-all resize-none leading-relaxed"
                                            />
                                            <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                                {review.length > 0 && (
                                                    <span className={`text-xs ${review.length > 450 ? 'text-orange-400' : 'text-rich-black-500'}`}>
                                                        {500 - review.length} left
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-8 pb-8 flex gap-4">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-6 py-3.5 font-semibold bg-rich-black-700/50 text-rich-black-200 rounded-xl hover:bg-rich-black-600 hover:text-white transition-all border border-rich-black-600"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || rating === 0}
                                        whileHover={rating > 0 && !isSubmitting ? { scale: 1.02 } : {}}
                                        whileTap={rating > 0 && !isSubmitting ? { scale: 0.98 } : {}}
                                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 font-bold rounded-xl transition-all duration-200 ${
                                            isSubmitting || rating === 0
                                                ? 'bg-rich-black-700 text-rich-black-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-rich-black-900 shadow-[0_4px_20px_rgba(255,214,10,0.3)] hover:shadow-[0_6px_25px_rgba(255,214,10,0.4)]'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                    className="w-5 h-5 border-2 border-rich-black-400 border-t-transparent rounded-full"
                                                />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <span>Submit Review</span>
                                                <FiSend className="text-sm" />
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default RatingModal;