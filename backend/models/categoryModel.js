const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

categorySchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('category', categorySchema);
