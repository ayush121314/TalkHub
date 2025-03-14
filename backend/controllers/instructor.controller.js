const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors/custom-error');

const getInstructorDetails = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id)
      .select('-password')
      .select('name email role profile createdAt');

    if (!instructor) {
      throw new CustomError('Instructor not found', StatusCodes.NOT_FOUND);
    }

    if (instructor.role !== 'professor') {
      throw new CustomError('User is not an instructor', StatusCodes.BAD_REQUEST);
    }

    res.status(StatusCodes.OK).json({
      instructor: {
        id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        profile: instructor.profile,
        createdAt: instructor.createdAt
      }
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to fetch instructor details', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getInstructorDetails
}; 