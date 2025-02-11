const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'professor', 'admin'],
    default: 'student'
  },
  profile: {
    profilePic: String,
    linkedinProfile: String,
    personalWebsite: String,
    organization: String,
    speakerBio: String,
    socialMediaHandle1: String,
    socialMediaHandle2: String,
    additionalInfo: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);