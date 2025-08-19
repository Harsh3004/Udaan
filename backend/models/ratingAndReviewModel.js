const mongoose = require('mongoose');

const ratingAndReviewSchema = new mongoose.Schema({
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
});

const ratingAndReviewModel = mongoose.model('ratingAndReview',ratingAndReviewSchema);
module.exports = ratingAndReviewModel;