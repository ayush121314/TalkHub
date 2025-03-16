const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { promisify } = require('util');

const getProfile = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to upload to Cloudinary using promises
const uploadToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const updateProfile = async (req, res) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    
    const userId = req.user._id;
    console.log("Processing profile update for user ID:", userId);
    
    // Fetch the existing user profile
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      console.log("🚨 User Not Found");
      return res.status(404).json({ message: "User not found" });
    }

    // Start with existing profile data
    let updateData = { profile: { ...existingUser.profile } };

    // Handle profile picture removal if requested
    if (req.body.removeProfileImage === "true") {
      console.log("Removing profile image as requested");
      updateData.profile.profilePic = null;
    }

    // Handle file upload if present
    let profilePicUrl = null;
    if (req.files) {
      // Check for the file either in 'file' or 'profileImage' field
      const uploadedFile = req.files.file || req.files.profileImage;
      
      if (uploadedFile) {
        console.log("Processing file upload:", uploadedFile.name);
        try {
          // Upload to Cloudinary
          const uploadResult = await uploadToCloudinary(uploadedFile.data, {
            folder: "profile_pictures",
            transformation: [
              { width: 400, height: 400, crop: "fill" },
              { quality: "auto" }
            ]
          });
          
          console.log("Cloudinary upload successful:", uploadResult.secure_url);
          profilePicUrl = uploadResult.secure_url;
          updateData.profile.profilePic = profilePicUrl;
        } catch (uploadError) {
          console.error("🚨 Error uploading to Cloudinary:", uploadError);
          return res.status(500).json({ message: "Error uploading image" });
        }
      }
    }

    // Update other profile fields
    const fields = ["linkedinProfile", "personalWebsite", "organization", "speakerBio", "additionalInfo", "socialMediaHandle1", "socialMediaHandle2"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData.profile[field] = req.body[field];
      }
    });

    console.log("Updating user profile with data:", JSON.stringify(updateData));

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      console.log("🚨 User Not Found during update");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Profile updated successfully");
    res.json(updatedUser);
  } catch (error) {
    console.error("🔥 Error in updateProfile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getProfile,
  updateProfile
};