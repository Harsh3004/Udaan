const mongoose = require('mongoose');
const { resetPasswordToken } = require('../controllers/resetPassword');

const userSchema = new mongoose.Schema({
    fName: {
        type: String,
        required: [true, "First Name is required"],
        trim: true
    },
    lName: {
        type: String,
        required: [true, "Last Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['Student', 'Instructor', 'Admin'],
        default: "Student"
    },
    profileImage: {
        type: String,
        default: "",
    },
    token: {
        type: String
    },
    resetPasswordExpiry: {
        type: Date
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'additionalDetails'
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course'
    }]
});

const userModel = mongoose.model('user',userSchema);
module.exports = userModel;