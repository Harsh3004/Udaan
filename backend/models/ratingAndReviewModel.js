const mongoose = require('mongoose');

const ratingAndReviewSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    rating:{
        type: Number,
        required: true
    },
    review: {
        type: String,
    },
}, {
    timestamps: true
});

// One review per user per course
ratingAndReviewSchema.index({ course: 1, user: 1 }, { unique: true });

const ratingAndReviewModel = mongoose.model('ratingAndReview',ratingAndReviewSchema);
module.exports = ratingAndReviewModel;