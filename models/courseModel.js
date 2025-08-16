const mongoose = require('mongoose');
const userModel = require('./userModel');
const sendMail = require('../utils/sendMail');

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
        url : { type: String },
        public_id: {type: String}
    },
    whatyouwilllearn: {
        type: String
    },
    section: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'section'
    }]
})

courseSchema.post("save", async function(doc,next){
    try{
        // const instructor = await userModel.findById(doc.instructor);
        const instructor = await userModel.findByIdAndUpdate(
                doc.instructor,
                { $push: { courses: doc._id } },
                { new: true }
            );

        const response = await sendMail(instructor.email,
                `Course Created Successfully 🎉`,
                `Your course was uploaded successfully`
            )

        console.log(`Course creation mail send successfully`);
        next();
    }catch(error){
        console.error("Error in post-save middleware:", error);
        next(error);
    }
});

const courseModel = mongoose.model('course',courseSchema);
module.exports = courseModel;