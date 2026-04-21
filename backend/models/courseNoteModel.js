const mongoose = require('mongoose');

const courseNoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course',
        required: true
    },
    subsectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subsection',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    // Optional: timestamp in the video when this note was taken (in seconds)
    videoTimestamp: {
        type: Number,
        default: null
    }
}, { timestamps: true });

// Index for fast lookup per user per lesson
courseNoteSchema.index({ userId: 1, subsectionId: 1 });

const courseNoteModel = mongoose.model('courseNote', courseNoteSchema);
module.exports = courseNoteModel;
