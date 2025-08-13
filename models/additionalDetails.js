const mongoose = require('mongoose');

const additionalDetailsSchema = new mongoose.Schema({
        profession: {
            type: String,
            enum: ['Teacher','Developer','Student','Freelancer','Others']
        },
        dob: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        },
        bio: {
            type: String,
        }

});

const additionalDetailsModel = mongoose.model('additionalDetails',additionalDetailsSchema);
module.exports = additionalDetailsModel;