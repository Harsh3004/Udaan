const mongoose = require('mongoose');

const additionalDetailsSchema = new mongoose.Schema({
        profession: {
            type: String,
            enum: ['Teacher','Developer','Student','Freelancer','Others'],
            trim: true
        },
        dob: {
            type: String,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        },
        mobile: {
            type: String,
            length: 10, 
            trim: true
        },
        bio: {
            type: String,
            trim: true
        }

});

const additionalDetailsModel = mongoose.model('additionalDetails',additionalDetailsSchema);
module.exports = additionalDetailsModel;