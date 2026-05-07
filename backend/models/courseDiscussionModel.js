const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },
    parentReply: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courseDiscussion',
        default: null
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'courseDiscussion'
    }],
    isInstructorReply: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

discussionSchema.index({ course: 1, createdAt: -1 });
discussionSchema.index({ parentReply: 1 });

const courseDiscussion = mongoose.model('courseDiscussion', discussionSchema);
module.exports = courseDiscussion;