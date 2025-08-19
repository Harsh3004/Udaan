const additionalDetailsModel = require('../models/additionalDetails');
const userModel = require('../models/userModel');
const { isFileSupported, uploadToCloudinary } = require('../utils/cloudinaryUploader');

exports.updateProfile = async (req,res) => {
    try{
        const updateDetails = req.body;
        const userId = req.user.id;

        if(!userId){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }

        // const user = await userModel.findById(userId);
        // if(!user){
        //     return res.status(404).json({
        //         success: false,
        //         message: `User Not Found`
        //     })
        // }

        let user;
        if(req.files && req.files.file){
            const supportedTypes = ['jpeg','jpg','png'];
            const file = req.files.file;

            if(!isFileSupported(file.name.split('.')[1], supportedTypes)){
                return res.status(400).json({
                    success: false,
                    message: `File Type Not Supported`
                })
            }

            const cloudResponse = await uploadToCloudinary(file,'Udaan');
            user = await userModel.findByIdAndUpdate(
                userId,
                {profileImage: cloudResponse.url},
                {new: true}
            )
        }

        if(!user)
            user = await userModel.findById(userId);
        
        const profile = await additionalDetailsModel.findByIdAndUpdate(user.additionalDetails,updateDetails);
        return res.status(200).json({
            success: true,
            message: `Profile updated successfully`,
            profile,
            user
        })
    }catch(err){
        return res.status(500).json({
            success: false,
            message: `Error: ${err.message}`
        })
    }
}

exports.showProfileDetails = async (req,res) => {
    try{
        const userId = req.user.id;

        if(!userId){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }

        const user = await userModel.findById(userId).populate('additionalDetails').exec();
        if(!user){
            return res.status(404).json({
                success: false,
                message: `User Not found`
            })
        }

        // const profile = await additionalDetailsModel.findById(profileId);
        // if(!profile){
        //     return res.status(404).json({
        //         success: false,
        //         message: `Not Found`
        //     })
        // }

        // We also need name and email and other details and for that we also want to avoid sharing secure data -- check it
        // profile.image = user.profileImage;

        return res.status(200).json({
            success: true,
            user
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}