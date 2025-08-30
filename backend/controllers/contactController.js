const sendMail = require("../utils/sendMail");
require('dotenv').config();

exports.contact = async (req,res) => {
    try{
        console.log(`Contacting with support`);
        const {firstName, lastName, email, phone,message} = req.body;
        if(!firstName || !lastName || !email || !phone || !message){
            return res.status(400).json({
                success: false,
                message: `Information Missing`
            })
        }

        await sendMail(process.env.SUPPORT_MAIL, `USER REQUEST`, 
            `User: ${firstName} ${lastName} \nUser Email: ${email} \n Message: ${message} `
        );
        await sendMail(email, `We receive you request`, `Thanks! We'll get back to you soon`)
        return res.status(200).json({
            success: true,
            message: `Contacted Successfully`
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: `Error: ${err.message}`
        })
    }
}