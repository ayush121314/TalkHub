const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

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

const updateProfile = async (req, res) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const userId = req.user._id;
    // Fetch the existing user profile to prevent data loss
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      console.log("🚨 User Not Found");
      return res.status(404).json({ message: "User not found" });
    }

    let updateData = { profile: { ...existingUser.profile } }; // Merge existing data

    // **Handle Profile Picture Removal**
    if (req.body.removeProfileImage === "true") {
      updateData.profile.profilePic = null;
    }

    // Check if a file was uploaded - using express-fileupload now
    if (req.files && req.files.file) {
      try {
        const file = req.files.file;
        
        // Using the file data directly with Cloudinary
        const uploadResponse = await cloudinary.uploader.upload_stream({
          folder: "profile_pictures",
          transformation: [
            { width: 400, height: 400, crop: "fill" },
            { quality: "auto" },
          ],
        }, (error, result) => {
          if (error) {
            console.error("🚨 Error uploading to Cloudinary:", error);
            return res.status(500).json({ message: "Error uploading image" });
          }
          
          // Continue with profile update after successful upload
          finishProfileUpdate(result.secure_url);
        }).end(file.data);
        
      } catch (error) {
        console.error("🚨 Error processing file upload:", error);
        return res.status(500).json({ message: "Error processing file upload" });
      }
    } else {
      // If no file was uploaded, just update the other profile fields
      finishProfileUpdate();
    }
    
    // Function to finish updating the profile after handling the file upload
    async function finishProfileUpdate(profilePicUrl = null) {
      if (profilePicUrl) {
        updateData.profile.profilePic = profilePicUrl;
      }

      const fields = ["linkedinProfile", "personalWebsite", "organization", "speakerBio", "additionalInfo", "socialMediaHandle1", "socialMediaHandle2"];
      fields.forEach((field) => {
        if (req.body[field]) {
          updateData.profile[field] = req.body[field];
        }
      });

      try {
        const user = await User.findByIdAndUpdate(
          userId,
          { $set: updateData },
          { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
          console.log("🚨 User Not Found");
          return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
      } catch (error) {
        console.error("🔥 Error updating user:", error);
        res.status(500).json({ message: "Server error" });
      }
    }
  } catch (error) {
    console.error("🔥 Error in updateProfile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getProfile,
  updateProfile
};