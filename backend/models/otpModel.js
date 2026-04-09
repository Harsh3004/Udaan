    const mongoose = require('mongoose');
    const sendMail = require('../utils/sendMail');
    const fs = require('fs/promises');
    const path = require('path');

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
            const text = `Your verification OTP for Udaan is: ${otp}. It will expire in 5 minutes.`;
            const templatePath = path.join(__dirname, '..', 'templates', 'otp-email.html');
            let htmlTemplate = await fs.readFile(templatePath, 'utf-8');

            let htmlBody = htmlTemplate.replace('{{OTP}}', otp);
            htmlBody = htmlBody.replace('{{EXPIRATION}}', '5 minutes');

            await sendMail(
                email,
                'Udaan - OTP Verification',
                text,
                htmlBody
            );

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