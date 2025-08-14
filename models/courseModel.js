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
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
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
    },
    section: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'section'
    }]
})

const courseModel = mongoose.model('course',courseSchema);
module.exports = courseModel;