const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const cloudinaryConnect = () => {
    try{
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        console.log(`Cloudinary Connect Successfully`);
    }catch(error){
        console.log(`Error in connecting with cloudinary: ${error.message}`);
    }
}


module.exports = cloudinaryConnect;
