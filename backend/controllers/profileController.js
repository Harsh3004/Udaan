const additionalDetailsModel = require('../models/additionalDetails');
const userModel = require('../models/userModel');
const { isFileSupported, uploadToCloudinary } = require('../utils/cloudinaryUploader');

exports.updateProfile = async (req,res) => {
    try{
        const updateDetails = req.body;
        const userId = updateDetails.user;
        
        if(!updateDetails && !updateDetails.user){
            return res.status(400).json({
                success: false,
                message: `Missing Information`
            })
        }
        
        let user = undefined;
        let cloudResponse = undefined;
        if(updateDetails.file){
            console.log("File: ",updateDetails);
            const supportedTypes = ['jpeg','jpg','png'];
            const file = updateDetails.file;
            
            if(!isFileSupported(file.name.split('.')[1], supportedTypes)){
                return res.status(400).json({
                    success: false,
                    message: `File Type Not Supported`
                })
            }
            
            cloudResponse = await uploadToCloudinary(file,'Udaan');
        }
        
        const payload = {
            fName: updateDetails.fName,
            lName: updateDetails.lName,
        }

        if(cloudResponse)
            payload.profileImage = cloudResponse.url;

        try{
            user = await userModel.findByIdAndUpdate(userId,payload,{new: true})
        }
        catch(err){
            return res.status(400).json({
                success: false,
                message: 'Error while updating profile'
            })
        }

        console.log(`Verifying`);
        
        console.log(updateDetails);
        if(!user)
            user = await userModel.findById(userId);
        console.log(updateDetails);

        const profile = await additionalDetailsModel.findByIdAndUpdate(user.additionalDetails,updateDetails,{new: true});

        const userObject = user.toObject();
        
        userObject.additionalDetails = profile;
        userObject.password = undefined;

        return res.status(200).json({
            success: true,
            message: `Profile updated successfully`,
            userObject
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