const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userModel = require('../models/userModel')
const otpModel = require('../models/otpModel');
const additionalDetails = require('../models/additionalDetails');
const courseModel = require('../models/courseModel');
const sendMail = require('../utils/sendMail');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

exports.sendOtp = async (req,res) => {
    try{
        const data = req.body;
        const email = data?.email;

        if(!email){
            return res.status(404).json({
                success: false,
                message: `Invalid information`
            })
        }

        // generate otp
        const otp = crypto.randomInt(100000,999999).toString();

        const otp_payload = new otpModel({ email, otp });
        await otp_payload.save();

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
        console.log(`Verifying status`);
        const {fName,lName,email,password,confirmPassword,role,otp} = req.body;

        console.log('fetched details');
        if(!fName || !lName || !email || !password || !confirmPassword || !otp){
            console.log(`Enter all details carefully.`);
            return res.status(400).json({
                success: false,
                message: 'Missing Information'
            })
        }

        if(password !== confirmPassword){
            console.log(`password, confirm password does not match`);
            return res.status(400).json({
                success: false,
                message: `password and confirm password does not match`
            })
        }

        const existingUser = await userModel.findOne({email: email,role: role});
        if(existingUser){
            console.log(`Existing User`);
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            })
        }

        try{
            const recentOtp = await otpModel.find({email}).sort({createdAt: -1}).limit(1);
            if(!recentOtp){
                console.log(`Otp Expires`);
                return res.status(404).json({
                    success: false,
                    message: `Otp Expires, Try Again`
                })
            }

            if(recentOtp[0].otp !== otp){
                console.log(`Otp Not matched`);
                return res.status(401).json({
                    success: false,
                    message: `Invalid Otp`
                })
            }
        }catch(err){
            console.log(`Error while matching otp`);
            return res.status(400).json({
                success: false,
                message: `Error in OTP verification: ${err.message}`
            })
        }

        let hashPassword;
        
        try{
            hashPassword = await bcrypt.hash(password,10);
        }catch(err){
            console.log(`Error in Hashing`);
            return res.status(500).json({
                success: false,
                message: `error in hashing`
            })
        }

        const profile = await additionalDetails.create({
            profession: null,
            dob: null,
            gender: null,
            mobile: null,
            bio: null
        });

        let userDetails;
        try{
            userDetails = await userModel.create({
                fName,
                lName,
                email,
                password: hashPassword,
                role,
                profileImage: `https://api.dicebear.com/7.x/initials/png?seed=${fName}${lName}&size=128`,
                additionalDetails: profile._id
            })
        }catch(error){
            await additionalDetails.findByIdAndDelete(profile._id);
            throw error;
        }

        userDetails = await userModel.findById(userDetails._id).populate('additionalDetails').exec();
        userDetails.password = undefined;

        const payload = {email: userDetails.email, id: userDetails._id, role: userDetails.role};
        const token = jwt.sign(
            payload,
            process.env.SECRET_KEY,
            { expiresIn: '7d' }
        );

        userDetails.token = token;

        const options = {
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly: true,
            sameSite: 'none',
            secure: true,
        };

        // Send Welcome Email
        try {
            const templatePath = path.join(__dirname, '../templates/welcome-email.html');
            let emailTemplate = fs.readFileSync(templatePath, 'utf8');
            
            emailTemplate = emailTemplate.replace('{{NAME}}', `${fName} ${lName}`);
            emailTemplate = emailTemplate.replace('{{CLIENT_URL}}', process.env.CLIENT_URL_PROD || process.env.CLIENT_URL_DEV);

            await sendMail(
                email,
                'Welcome to Udaan - Account Created Successfully',
                `Hi ${fName}, Welcome to Udaan! Your account has been created successfully.`,
                emailTemplate
            );
        } catch (mailError) {
            console.error(`Failed to send welcome email: ${mailError.message}`);
        }

        return res.cookie('token',token,options).status(200).json({
            success: true,
            message: `SignUp successfully`,
            userDetails
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

        const userDetails = await userModel.findOne({email, role: role})
        .populate('additionalDetails')
        .exec();

        console.log(userDetails);
        
        if(!userDetails){
            return res.status(401).json({
                success: false,
                message: `User not exist`
            })
        }

        if(await bcrypt.compare(password,userDetails.password)){
            const payload = {email: userDetails.email, id: userDetails._id, role: userDetails.role};
            const token = jwt.sign(
                payload,
                process.env.SECRET_KEY,
                { expiresIn: '7d' }
            );

            userDetails.token = token;
            userDetails.password = undefined;

            req.user = userDetails;

            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true,
                sameSite: 'none',
                secure: true,
            }

            res.cookie('token',token,options).status(200).json({
                success: true,
                message: `Login Successfully`,
                userDetails
            })
        }
        else{
            return res.status(401).json({
                success: false,
                message: `Invalid Password`
            })
        }
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: `While login: ${err.message}`
        })
    }
}

exports.logout = async (req, res) => {
    try {
        const options = {
            httpOnly: true,
            sameSite: 'none',
            secure: true
        };

        res.clearCookie('token', options).status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: `While logout: ${err.message}`
        });
    }
}

exports.changePassword = async (req,res) => {
    try{
        const {password,newPassword} = req.body;
        const userId = req.body.userId;
        
        if(!userId || !password || !newPassword){
            return res.status(400).json({
                success: false,
                message: `Enter details carefully`
            })
        }
        
        const user = await userModel.findById(userId);
        if(!user){
            return res.status(400).json({
                success: false,
                message: `User not Found`
            })
        }
        
        if(!(await bcrypt.compare(password,user.password))){
            return res.status(401).json({
                success: false,
                message: `Invalid password`
            })
        }
        
        if(password === newPassword){
            return res.status(400).json({
                success: false,
                message: `New password should be different.`
            })
        }
        
        console.log(`Changing Password`);
        let hashPassword;
        try{
            hashPassword = await bcrypt.hash(newPassword,10);
        }catch(err){
            return res.status(500).json({
                success: false,
                message: `error in hashing`
            })
        }
        
        const response = await userModel.findByIdAndUpdate(
            userId,
            {password: hashPassword},
            {new: true}
        );

        console.log(user,response);
        
        sendMail(user.email,`Changed Password`,`Your password changed successfully`);
        
        return res.status(200).json({
            success: true,
            message: `Password updated successfully.`
        })

    }catch(error){
        return res.status(404).json({
            success: false,
            message: `error while changing password: ${error.message}`
        })
    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId).populate('additionalDetails');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'Instructor') {
            const courses = await courseModel.find({ instructor: userId });
            const hasEnrolledStudents = courses.some(course => course.studentEnrolled && course.studentEnrolled.length > 0);

            if (hasEnrolledStudents) {
                return res.status(403).json({
                    success: false,
                    message: 'Cannot delete account. You have students enrolled in your courses. Please contact support.'
                });
            }
        }

        if (user.role === 'Student') {
            await courseModel.updateMany(
                { studentEnrolled: userId },
                { $pull: { studentEnrolled: userId } }
            );
        }

        if (user.additionalDetails) {
            await additionalDetails.findByIdAndDelete(user.additionalDetails._id);
        }

        await userModel.findByIdAndDelete(userId);

        return res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting account:', error);
        return res.status(500).json({
            success: false,
            message: `Error deleting account: ${error.message}`
        });
    }
}

exports.googleAuth = async (req, res) => {
    try {
        console.log(`Starting Google Auth...`);
        const { token, role } = req.body;

        if (!token) {
            console.log("Missing Google Token");
            return res.status(400).json({
                success: false,
                message: "Missing Google Token"
            });
        }

        // 1. Fetch user data from Google
        console.log("Fetching Google user info...");
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const googleUser = await googleResponse.json();
        console.log("Google user:", googleUser.email);

        if (!googleUser.email) {
            console.log("Failed to verify Google Token");
            return res.status(400).json({
                success: false,
                message: "Failed to verify Google Token"
            });
        }

        const email = googleUser.email;

        // 2. Check if the user already exists
        let userDetails = await userModel.findOne({ email }).populate('additionalDetails').exec();

        // 3. Seamless Signup: If they don't exist, create their account
        if (!userDetails) {
            console.log(`New Google User, creating account...`);
            
            // Generate a random, secure password since they login via Google
            const randomPassword = crypto.randomBytes(16).toString('hex');
            let hashPassword;
            try {
                hashPassword = await bcrypt.hash(randomPassword, 10);
            } catch (err) {
                console.log(`Error in Hashing Google User Password: ${err.message}`);
                return res.status(500).json({ success: false, message: `error in hashing` });
            }

            // Create their empty profile
            const profile = await additionalDetails.create({
                profession: null,
                dob: null,
                gender: null,
                mobile: null,
                bio: null
            });

            try {
                userDetails = await userModel.create({
                    fName: googleUser.given_name,
                    lName: googleUser.family_name || '.',
                    email: email,
                    password: hashPassword,
                    role: role || 'Student', // Default to Student if role isn't passed
                    profileImage: googleUser.picture, // Use their real Google Profile Picture!
                    additionalDetails: profile._id
                });
                
                userDetails = await userModel.findById(userDetails._id).populate('additionalDetails').exec();
                
                // Send Welcome Email for new Google signups
                try {
                    const templatePath = path.join(__dirname, '../templates/welcome-email.html');
                    let emailTemplate = fs.readFileSync(templatePath, 'utf8');
                    
                    emailTemplate = emailTemplate.replace('{{NAME}}', `${userDetails.fName} ${userDetails.lName}`);
                    emailTemplate = emailTemplate.replace('{{CLIENT_URL}}', process.env.CLIENT_URL_PROD || process.env.CLIENT_URL_DEV);

                    await sendMail(
                        email,
                        'Welcome to Udaan - Account Created Successfully',
                        `Hi ${userDetails.fName}, Welcome to Udaan! Your account has been created successfully.`,
                        emailTemplate
                    );
                } catch (mailError) {
                    console.error(`Failed to send welcome email: ${mailError.message}`);
                }
            } catch (error) {
                await additionalDetails.findByIdAndDelete(profile._id);
                throw error;
            }
        }

        // 4. Log them in (Generate JWT)
        console.log(`Generating JWT for Google User...`);
        console.log(`SECRET_KEY exists: ${!!process.env.SECRET_KEY}`);
        console.log(`userDetails exists: ${!!userDetails}`);
        if (userDetails) {
            console.log(`userDetails.email: ${userDetails.email}`);
            console.log(`userDetails._id: ${userDetails._id}`);
            console.log(`userDetails.role: ${userDetails.role}`);
        }
        
        try {
            const payload = { 
                email: userDetails.email, 
                id: userDetails._id, 
                role: userDetails.role 
            };
            
            const jwtToken = jwt.sign(
                payload,
                process.env.SECRET_KEY,
                { expiresIn: '7d' }
            );

            // Convert to plain object to safely manipulate
            const userObj = userDetails.toObject();
            userObj.token = jwtToken;
            delete userObj.password;

            console.log("Sending simplified response...");
            return res.status(200).json({
                success: true,
                message: `Google Login Successfully`,
                token: jwtToken,
                user: {
                    id: userObj._id,
                    email: userObj.email,
                    role: userObj.role,
                    fName: userObj.fName,
                    lName: userObj.lName,
                    profileImage: userObj.profileImage
                }
            });
        } catch (jwtError) {
            console.error(`JWT Error: ${jwtError.message}`);
            console.error(`JWT Error stack: ${jwtError.stack}`);
            return res.status(500).json({
                success: false,
                message: `JWT Error: ${jwtError.message}`
            });
        }
    } catch (error) {
        console.log(`Error during Google Auth: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: `While google login: ${error.message}`
        });
    }
}