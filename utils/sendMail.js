const nodemailer = require('nodemailer');
require('dotenv').config();

const sendMail = async (email, subject, text) => {
    try{
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        let info = transporter.sendMail({
            from: `${process.env.MAIL_USER}`,
            to: `${email}`,
            subject: `${subject}`,
            text: `${text}`
        })

        return info;
    }catch(err){
        console.log(`Error while sending mail: ${err.message}`);
    }
};

module.exports = sendMail;