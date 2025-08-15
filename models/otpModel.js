const mongoose = require('mongoose');
const sendMail = require('../utils/sendMail');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 300
    }
});

async function sendVerificationEmail(email,otp) {
    try{
        console.log("Sending verification mail..");

        const response = sendMail(email,
            `Study Notion - Otp Verification`,
            `Verification Otp: ${otp}. It will expire in 5 minutes.`
        )

        console.log(`Verification mail send successfully`);
    }catch(err){
        console.log(`Verification mail not send: ${err.message}`);
        throw err;
    } 
}

otpSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

const otpModel = mongoose.model('otp',otpSchema);
module.exports = otpModel;