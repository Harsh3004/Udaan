const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    completedVideos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "subSection"
    }]
});

const courseProgressModel = mongoose.model('courseProgress', courseProgressSchema);
module.exports = courseProgressModel;