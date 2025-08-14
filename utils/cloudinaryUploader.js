const cloudinary = require('cloudinary');

exports.isFileSupported = (type,supportedTypes) => {
  return supportedTypes.includes(type);
}

exports.uploadToCloudinary = async (file,folder) => {
  try {
    const options = {folder};
    console.log(`Uploading to cloudinary`);
    return await cloudinary.uploader.upload(file.tempFilePath,options);
  }
  catch (error) {
    throw new Error('Cloudinary upload failed: ' + error.message);
  }
}