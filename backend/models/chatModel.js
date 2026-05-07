const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 2000
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    messages: [messageSchema],
    lastMessage: {
        type: String,
        default: ''
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    studentUnreadCount: {
        type: Number,
        default: 0
    },
    instructorUnreadCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

chatSchema.index({ course: 1, student: 1 }, { unique: true });
chatSchema.index({ lastMessageAt: -1 });

const chatModel = mongoose.model('chat', chatSchema);
module.exports = chatModel;