const cloudinary = require('cloudinary').v2;
const fs = require('fs');

exports.isFileSupported = (type,supportedTypes) => {
  return supportedTypes.includes(type);
}

exports.uploadToCloudinary = async (file,folder,height,quality) => {
  try {
    let detectedType = 'auto';
    if(file.mimetype.split('/')[0] === 'video')
      detectedType = 'video';
    
    const options = {
      folder,
      resource_type: detectedType
    };

    if(detectedType === 'image'){
      if(height)
        options.height = height;
      if(quality)
        options.quality = quality;
    }

    const tempFilePath = file.tempFilePath;
    const cloudResponse = await cloudinary.uploader.upload(tempFilePath,options);
    return {
      url: cloudResponse.secure_url,
      public_id: cloudResponse.public_id
    }
  }
  catch (error) {
    throw error;
  }
}