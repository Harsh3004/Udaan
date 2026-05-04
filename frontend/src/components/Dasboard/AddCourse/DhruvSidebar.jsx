import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiCheckCircle, FiCircle, FiBook, FiTag, FiDollarSign, FiUsers, FiClock, FiLayers } from 'react-icons/fi';

// ---------------------------------------------------------------------------
// Circular progress ring (SVG)
// ---------------------------------------------------------------------------
const ProgressRing = ({ percent }) => {
    const r = 28;
    const circumference = 2 * Math.PI * r;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
                {/* Track */}
                <circle cx="36" cy="36" r={r} fill="none" stroke="#2C333F" strokeWidth="5" />
                {/* Progress */}
                <motion.circle
                    cx="36" cy="36" r={r}
                    fill="none"
                    stroke="url(#dhruvGrad)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                />
                <defs>
                    <linearGradient id="dhruvGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>
            </svg>
            <span className="absolute text-xs font-bold text-violet-300">{percent}%</span>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Single field row in sidebar
// ---------------------------------------------------------------------------
const FieldRow = ({ icon: Icon, label, value, filled }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-start gap-2 py-2 border-b border-rich-black-700 last:border-0"
    >
        <div className="mt-0.5 shrink-0">
            {filled
                ? <FiCheckCircle className="text-violet-400 w-4 h-4" />
                : <FiCircle className="text-rich-Black-300 w-4 h-4" />
            }
        </div>
        <div className="min-w-0">
            <p className="text-xs text-rich-Black-300 font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-sm mt-0.5 truncate ${filled ? 'text-rich-black-5' : 'text-rich-black-600 italic'}`}>
                {filled ? (Array.isArray(value) ? value.join(', ') || '—' : value) : 'Not yet...'}
            </p>
        </div>
    </motion.div>
);

// ---------------------------------------------------------------------------
// DhruvSidebar
// ---------------------------------------------------------------------------
const DhruvSidebar = ({ courseData, onViewDraft }) => {
    // Calculate completion percentage based on required fields
    const fields = useMemo(() => [
        { key: 'title', label: 'Title', icon: FiBook },
        { key: 'description', label: 'Description', icon: FiBook },
        { key: 'language', label: 'Language', icon: FiBook },
        { key: 'difficulty', label: 'Difficulty', icon: FiBook },
        { key: 'targetAudience', label: 'Audience', icon: FiUsers },
        { key: 'category', label: 'Category', icon: FiTag },
        { key: 'price', label: 'Price', icon: FiDollarSign },
        { key: 'estimatedDuration', label: 'Duration', icon: FiClock },
    ], []);

    const filled = fields.filter(f => {
        const v = courseData?.[f.key];
        if (Array.isArray(v)) return v.length > 0;
        return v !== undefined && v !== '' && v !== null;
    });

    const percent = Math.round((filled.length / fields.length) * 100);
    const hasEnoughForDraft = courseData?.title && courseData?.description;

    const difficultyColors = {
        Beginner: 'bg-emerald-900 text-emerald-300 border-emerald-700',
        Intermediate: 'bg-amber-900 text-amber-300 border-amber-700',
        Advanced: 'bg-red-900 text-red-300 border-red-700',
    };

    return (
        <div className="w-72 shrink-0 h-full bg-rich-black-900 border-r border-rich-black-700 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-rich-black-700 flex items-center gap-3">
                <ProgressRing percent={percent} />
                <div>
                    <p className="text-sm font-semibold text-rich-black-5">Course Outline</p>
                    <p className="text-xs text-rich-Black-300">{filled.length}/{fields.length} fields complete</p>
                </div>
            </div>

            {/* Badges row */}
            <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-rich-black-700">
                <AnimatePresence>
                    {courseData?.difficulty && (
                        <motion.span
                            key="diff"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${difficultyColors[courseData.difficulty] || 'bg-rich-black-700 text-rich-black-100 border-rich-black-600'}`}
                        >
                            {courseData.difficulty}
                        </motion.span>
                    )}
                    {courseData?.price !== undefined && courseData?.price !== '' && (
                        <motion.span
                            key="price"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-xs px-2 py-0.5 rounded-full border bg-yellow-900 text-yellow-50 border-yellow-800 font-medium"
                        >
                            {Number(courseData.price) === 0 ? 'Free' : `₹${courseData.price}`}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Field list */}
            <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin">
                {fields.map(({ key, label, icon }) => {
                    const v = courseData?.[key];
                    const isFilled = Array.isArray(v) ? v.length > 0 : (v !== undefined && v !== '' && v !== null);
                    return (
                        <FieldRow
                            key={key}
                            icon={icon}
                            label={label}
                            value={v}
                            filled={isFilled}
                        />
                    );
                })}

                {/* Modules section */}
                {courseData?.modules?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3"
                    >
                        <p className="text-xs text-rich-Black-300 font-medium uppercase tracking-wide flex items-center gap-1 mb-2">
                            <FiLayers className="w-3 h-3" /> Modules ({courseData.modules.length})
                        </p>
                        <div className="space-y-1">
                            {courseData.modules.map((mod, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-2 text-sm text-rich-black-100 bg-rich-black-800 rounded-lg px-3 py-2"
                                >
                                    <span className="w-5 h-5 rounded-full bg-violet-900 text-violet-300 text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                                    <span className="truncate">{mod.title || `Module ${i + 1}`}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Tags */}
                {courseData?.tags?.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                        <p className="text-xs text-rich-Black-300 font-medium uppercase tracking-wide mb-2">Tags</p>
                        <div className="flex flex-wrap gap-1">
                            {courseData.tags.map((t, i) => (
                                <span key={i} className="text-xs bg-rich-black-800 text-rich-black-100 px-2 py-0.5 rounded-full border border-rich-black-600">
                                    #{t}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* View Draft CTA */}
            <AnimatePresence>
                {hasEnoughForDraft && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        className="p-4 border-t border-rich-black-700"
                    >
                        <button
                            onClick={onViewDraft}
                            className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-violet-900/30"
                        >
                            View Full Draft →
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DhruvSidebar;
