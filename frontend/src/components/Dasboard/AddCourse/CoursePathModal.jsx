import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiX } from 'react-icons/fi';
import { BsChatDotsFill } from 'react-icons/bs';
import { MdOutlineLibraryBooks } from 'react-icons/md';

// Centering uses a flex wrapper (inset-0 flex items-center justify-center) so
// Framer Motion's own transform system never conflicts with Tailwind translate classes.

const CoursePathModal = ({ isOpen, onClose, onDhruv, onManual }) => {
    const leftRef  = useRef(null);
    const rightRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        leftRef.current?.focus();
        const onKey = (e) => {
            if (e.key === 'Escape')     { onClose(); return; }
            if (e.key === 'ArrowRight') { rightRef.current?.focus(); return; }
            if (e.key === 'ArrowLeft')  { leftRef.current?.focus();  return; }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Flex wrapper centers the card — no CSS translate on motion.div */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                        <motion.div
                            key="modal"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Choose how to create your course"
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="pointer-events-auto w-[min(92vw,780px)] bg-rich-black-800 border border-rich-black-600 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-8 pt-7 pb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-rich-black-5 tracking-tight">
                                        Create a New Course
                                    </h2>
                                    <p className="text-sm text-rich-Black-300 mt-1">
                                        How would you like to get started?
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-rich-black-700 text-rich-Black-300 hover:text-rich-black-5 transition-colors"
                                    aria-label="Close"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Cards */}
                            <div className="flex flex-col sm:flex-row gap-4 px-8 pb-8 pt-2">

                                {/* LEFT — Dhruv */}
                                <motion.button
                                    ref={leftRef}
                                    onClick={onDhruv}
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ duration: 0.18 }}
                                    className="group flex-1 relative flex flex-col items-center text-center p-7 rounded-xl border border-rich-black-600 bg-rich-black-900 hover:border-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors duration-200 cursor-pointer overflow-hidden"
                                >
                                    {/* Pulsing orb */}
                                    <div className="relative mb-6">
                                        <motion.div
                                            className="absolute inset-0 rounded-full"
                                            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)' }}
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                        <motion.div
                                            className="absolute inset-0 rounded-full"
                                            style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)' }}
                                            animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                                            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                                        />
                                        <div
                                            className="relative w-20 h-20 rounded-full flex items-center justify-center"
                                            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)' }}
                                        >
                                            <BsChatDotsFill className="w-8 h-8 text-white drop-shadow" />
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-rich-black-5 group-hover:text-violet-300 transition-colors duration-200">
                                        Create with Dhruv
                                    </h3>
                                    <p className="text-sm text-rich-Black-300 mt-1.5">Just talk, we'll build it</p>
                                    <p className="text-xs text-rich-black-400 mt-3 leading-relaxed max-w-[200px]">
                                        Chat naturally with our AI. Dhruv extracts every detail and assembles your course for you.
                                    </p>

                                    <span className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600/20 border border-violet-500/40 text-violet-300 uppercase tracking-widest">
                                        AI
                                    </span>
                                </motion.button>

                                {/* Divider */}
                                <div className="hidden sm:flex flex-col items-center justify-center gap-2 py-4">
                                    <div className="w-px flex-1 bg-rich-black-700" />
                                    <span className="text-xs text-rich-black-400 font-medium px-1">or</span>
                                    <div className="w-px flex-1 bg-rich-black-700" />
                                </div>

                                {/* RIGHT — Manual */}
                                <motion.button
                                    ref={rightRef}
                                    onClick={onManual}
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ duration: 0.18 }}
                                    className="group flex-1 flex flex-col items-center text-center p-7 rounded-xl border border-rich-black-600 bg-rich-black-900 hover:border-rich-black-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rich-black-400 transition-colors duration-200 cursor-pointer"
                                >
                                    <div className="relative mb-6">
                                        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-rich-black-700 border border-rich-black-600 group-hover:border-rich-black-400 transition-colors duration-200">
                                            <MdOutlineLibraryBooks className="w-9 h-9 text-rich-black-100 group-hover:text-rich-black-5 transition-colors duration-200" />
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-rich-black-5 transition-colors duration-200">
                                        Manual Creation
                                    </h3>
                                    <p className="text-sm text-rich-Black-300 mt-1.5">Full control, step by step</p>
                                    <p className="text-xs text-rich-black-400 mt-3 leading-relaxed max-w-[200px]">
                                        Fill out the course form yourself. Great if you already have everything planned out.
                                    </p>
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CoursePathModal;
