const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userModel = require('../models/userModel')
const otpModel = require('../models/otpModel');
const additionalDetails = require('../models/additionalDetails');

require('dotenv').config();

exports.sendOtp = async (req,res) => {
    try{
        console.log("In auth sendotp..");
        
        // generate otp
        const otp = crypto.randomInt(100000,999999).toString();
        console.log(otp);
        
        const {email} = req.body;
        const otp_payload = await otpModel.create({
            email,otp
        });

        return res.status(200).json({
            success: true,
            message: `Otp Send Successfully`
        })
    }catch(err){
        return res.status(400).json({
            success: false,
            message: `Issue while sending otp: ${err.message}`
        })
    }
}

exports.signUp = async (req,res) => {
    try{
        const {fName,lName,email,password,confirmPassword,role,otp} = req.body;
        if(!fName || !lName || !email || !password || !confirmPassword || !otp){
            console.log(`Enter all details carefully.`);
            return res.status(400).json({
                success: false,
                message: 'Missing Information'
            })
        }

        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            })
        }

        if(password != confirmPassword){
            return res.status(400).json({
                success: false,
                message: `password and confirm password does not match`
            })
        }

        try{
            const recentOtp = await otpModel.find({email}).sort({createdAt: -1}).limit(1);
            console.log(`Otp in database: ${recentOtp[0].otp}`);
            if(!recentOtp){
                return res.status(404).json({
                    success: false,
                    message: `Otp Expires, Try Again`
                })
            }

            if(recentOtp[0].otp != otp){
                return res.status(401).json({
                    success: false,
                    message: `Invalid Otp`
                })
            }
        }catch(err){
            return res.status(400).json({
                success: false,
                message: `Error in OTP verification: ${err.message}`
            })
        }

        let hashPassword;
        try{
            hashPassword = await bcrypt.hash(password,10);
        }catch(err){
            return res.status(500).json({
                success: false,
                message: `error in hashing`
            })
        }

        const profile = await additionalDetails.create({
            profession: null,
            dob: null,
            gender: null,
            bio: null
        });

        const userDetails = await userModel.create({
            fName,
            lName,
            email,
            password: hashPassword,
            role,
            profileImage: `https://avatar.iran.liara.run/username?username=${fName}+${lName}`,
            additionalDetails: profile._id
        })

        return res.status(200).json({
            success: true,
            message: `SignUp successfully`
        })
    }   
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message
        })
    } 
}

exports.login = async (req,res) => {
    try{
        const {email,password,role} = req.body;
        if(!email || !password || !role){
            return res.status(400).json({
                success: false,
                message: `Missing Information - Enter details carefully`
            })
        }

        const userDetails = await userModel.findOne({email, role: role});
        if(!userDetails){
            return res.status(401).json({
                success: false,
                message: `User not exist`
            })
        }

        console.log(userDetails);
        if(await bcrypt.compare(password,userDetails.password)){
            const payload = {email: userDetails.email, id: userDetails._id, role: userDetails.role};
            const token = jwt.sign(
                payload,
                process.env.SECRET_KEY, 
                { expiresIn: '2h' }
            );
            console.log(payload);
            userDetails.token = token;
            userDetails.password = undefined;

            //check for it
            req.user = userDetails;

            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true
            }

            res.cookie('token',token,options).status(200).json({
                success: true,
                message: userDetails
            })
        }else{
            return res.status(403).json({
                success: false,
                message: `Invalid Password`
            })
        }
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}


// to be tested 
exports.changePassword = async (req,res) => {
    try{
        const {email,password,newPassword} = req.body;

        if(!email || !password || !newPassword){
            return res.status(400).json({
                success: false,
                message: `Enter details carefully`
            })
        }

        const user = userModel.findOne({email});
        if(!user){
            return res.status(400).json({
                success: false,
                message: `User not Found`
            })
        }

        if(!bcrypt.compare(password,user.password)){
            return res.status(400).json({
                success: false,
                message: `Invalid password`
            })
        }

        if(password == newPassword){
            return res.status(400).json({
                success: false,
                message: `New password should be different.`
            })
        }

        let hashPassword;
        try{
            hashPassword = await bcrypt.hash(password,10);
        }catch(err){
            return res.status(500).json({
                success: false,
                message: `error in hashing`
            })
        }

        const response = await userModel.findOneAndUpdate(
            {email: email},
            {password: hashPassword}
        );
        
        console.log(response);
        // Check if previous password entry was stored in cookie or other parameters then remove them
        
        return res.status(200).json({
            success: true,
            message: `Password updated successfully.`
        })

    }catch(error){
        return res.status(404).json({
            success: false,
            message: `error while changing password`
        })
    }
}