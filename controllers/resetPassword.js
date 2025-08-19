const userModel = require('../models/userModel');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const sendMail = require('../utils/sendMail');

exports.resetPasswordToken = async (req,res) => {
    try{
        const email = req.body.email;

        if(!email){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }

        const user = await userModel.findOne({email: email});
        if(!user){
            return res.status(404).json({
                success: false,
                message: `User does not Exist`
            })
        }

        const token = crypto.randomUUID();
        const updatedDetails = await userModel.findOneAndUpdate(
            {email: email},
            {
                token: token,
                resetPasswordExpiry: Date.now() + 5*60*1000
            },
            {new: true}
        );

        const url = `http://localhost:3000/update-password/${token}`;
        await sendMail(email,`RESET PASSWORD`,`RESET PASSWORD LINK: ${url}`);
        
        return res.status(200).json({
            success: true,
            message: `Reset password mail send successfully`
        })
    }catch(error){
        return res.status(404).json({
            success: false,
            message: `Error while sending reset password mail: ${error.message}`
        })
    }
}

exports.resetPassword = async (req,res) => {
    try{
        const {password,confirmPassword,token} = req.body;

        if(!password || !password || !token){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }

        if(password !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: `Password and confirm password does not match`
            })
        }
        
        const user = await userModel.findOne({token: token});
        if(!user){
            return res.status(404).json({
                success: false,
                message: `User not found`
            })
        }

        if(user.resetPasswordExpiry < Date.now()){
            return res.status(400).json({
                success: false,
                message: `Invalid Token`
            })
        }

        let hashPassword;
        try{
            hashPassword = await bcrypt.hash(password,10);
        }catch(err){
            return res.status(404).json({
                success: false,
                message: `error in hashing password`
            })
        }

        await userModel.findByIdAndUpdate(
            user._id,
            {password: hashPassword},
            {new: true}
        )

        return res.status(200).json({
            success: true,
            message: `Reset Password`
        })

    }catch(err){
        return res.status(404).json({
            success: false,
            message: `Error while reseting password`
        })
    }
}