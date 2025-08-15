const cloudinary = require('cloudinary');

exports.isFileSupported = (type,supportedTypes) => {
  return supportedTypes.includes(type);
}

exports.uploadToCloudinary = async (file,folder) => {
  try {
    const options = {
      folder,
      resource_type: "auto" 
    };

    console.log(`Uploading to cloudinary`);
    const cloudResponse = await cloudinary.uploader.upload(file.tempFilePath,options);
    return {
      url: cloudResponse.secure_url,
      public_id: cloudResponse.public_id
    }
  }
  catch (error) {
    throw new Error('Cloudinary upload failed: ' + error.message);
  }
}