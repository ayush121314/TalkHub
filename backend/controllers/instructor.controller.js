const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors/custom-error');

const getInstructorDetails = async (req, res) => {
  try {
    console.log('Fetching instructor details for ID:', req.params.id);
    
    const instructor = await User.findById(req.params.id)
      .select('-password -__v');

    if (!instructor) {
      console.log('Instructor not found for ID:', req.params.id);
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    // Helper function to clean profile fields
    const cleanProfileField = (value) => {
      if (!value || value === 'null' || value === '') {
        return undefined;
      }
      return value.trim();
    };

    // Get instructor title based on role
    const getTitle = (role) => {
      switch (role) {
        case 'professor':
          return 'Professor';
        case 'student':
          return 'Student Instructor';
        default:
          return 'Instructor';
      }
    };

    // Transform the instructor data
    const instructorData = {
      id: instructor._id,
      name: instructor.name,
      email: instructor.email,
      role: instructor.role,
      title: getTitle(instructor.role),
      createdAt: instructor.createdAt,
      // Clean and spread profile fields
      profilePic: cleanProfileField(instructor.profile?.profilePic),
      linkedinProfile: cleanProfileField(instructor.profile?.linkedinProfile),
      personalWebsite: cleanProfileField(instructor.profile?.personalWebsite),
      organization: cleanProfileField(instructor.profile?.organization),
      speakerBio: cleanProfileField(instructor.profile?.speakerBio),
      socialMediaHandle1: cleanProfileField(instructor.profile?.socialMediaHandle1),
      socialMediaHandle2: cleanProfileField(instructor.profile?.socialMediaHandle2),
      additionalInfo: cleanProfileField(instructor.profile?.additionalInfo)
    };

    console.log('Sending instructor data:', instructorData);

    return res.status(StatusCodes.OK).json({
      success: true,
      instructor: instructorData
    });
  } catch (error) {
    console.error('Error in getInstructorDetails:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch instructor details',
      error: error.message
    });
  }
};

module.exports = {
  getInstructorDetails
}; 