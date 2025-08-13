const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    desc: {
        type: String,
        trim: true
    },
    studentEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    Instuctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    language: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        trim: true
    },
    thumbnail: { 
        type: String
    },
    whatyouwilllearn: {
        type: String
    }
})

module.exports = mongoose.model('course',courseSchema);