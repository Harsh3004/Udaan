const nodemailer = require('nodemailer');
require('dotenv').config();

const sendMail = async (email, subject, text, html) => {
    try {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465, 
            secure: true,     
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        let info = await transporter.sendMail({
            from: `Udaan <${process.env.MAIL_USER}>`, 
            to: email,
            subject: subject,
            text: text, 
            html: html  
        });

        console.log(`Mail sent successfully: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error(`CRITICAL: Error while sending mail: ${err.message}`);
        throw err;
    }
};

module.exports = sendMail;