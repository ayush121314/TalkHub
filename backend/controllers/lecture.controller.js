const Lecture = require('../models/lecture.model');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors/custom-error');

// Get upcoming lectures
const getUpcomingLectures = async (req, res) => {
  try {
    const currentDate = new Date();
    const lectures = await Lecture.find({
      date: { $gte: currentDate },
      status: 'scheduled'
    })
    .populate('instructor', 'name email')
    .sort({ date: 1 });

    // Transform data to match frontend requirements
    const transformedLectures = lectures.map(lecture => ({
      id: lecture._id,
      title: lecture.title,
      description: lecture.description,
      instructor: lecture.instructor.name,
      date: lecture.date,
      time: lecture.time,
      mode: lecture.mode,
      venue: lecture.venue,
      meetLink: lecture.meetLink,
      capacity: lecture.capacity,
      registeredCount: lecture.registeredUsers.length,
     
      tags: lecture.tags || [], 
      isRegistered: lecture.registeredUsers.includes(req.user.userId)
    }));

    res.status(StatusCodes.OK).json(transformedLectures);
  } catch (error) {
    throw new CustomError('Failed to fetch upcoming lectures', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Get past lectures
const getPastLectures = async (req, res) => {
  try {
    const currentDate = new Date();
    const lectures = await Lecture.find({
      date: { $lt: currentDate },
      status: 'completed'
    })
    .populate('instructor', 'name email')
    .sort({ date: -1 });

    const transformedLectures = lectures.map(lecture => ({
      id: lecture._id,
      title: lecture.title,
      description: lecture.description,
      instructor: lecture.instructor.name,
      date: lecture.date,
      time: lecture.time,
      mode: lecture.mode,
      venue: lecture.venue,
      meetLink: lecture.meetLink,
      capacity: lecture.capacity,
      registeredCount: lecture.registeredUsers.length,
     
      tags: lecture.tags,
      recording: lecture.recording
    }));

    res.status(StatusCodes.OK).json(transformedLectures);
  } catch (error) {
    throw new CustomError('Failed to fetch past lectures', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Get scheduled talks (lectures created by the current user)
const getScheduledTalks = async (req, res) => {
  try {
    const lectures = await Lecture.find({
      instructor: req.user.userId,
      status: { $in: ['scheduled', 'ongoing'] }
    }).sort({ date: 1 });

    const transformedLectures = lectures.map(lecture => ({
      id: lecture._id,
      title: lecture.title,
      description: lecture.description,
      date: lecture.date,
      time: lecture.time,
      mode: lecture.mode,
      venue: lecture.venue,
      meetLink: lecture.meetLink,
      capacity: lecture.capacity,
      registeredCount: lecture.registeredUsers.length,
    
      tags: lecture.tags
    }));

    res.status(StatusCodes.OK).json(transformedLectures);
  } catch (error) {
    throw new CustomError('Failed to fetch scheduled talks', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Create a new lecture
const createLecture = async (req, res) => {
  try {
    // Basic field validation
    const requiredFields = ['title', 'description', 'date', 'time', 'mode', 'capacity'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        throw new CustomError(`Missing required field: ${field}`, StatusCodes.BAD_REQUEST);
      }
    }

    // Validate date is in the future
    const lectureDate = new Date(req.body.date);
    if (lectureDate < new Date()) {
      throw new CustomError('Lecture date must be in the future', StatusCodes.BAD_REQUEST);
    }

    // Set up base lecture data
    const lectureData = {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      instructor: req.user.userId,
      date: lectureDate,
      time: req.body.time,
      duration: parseInt(req.body.duration) || 60, // Default to 60 minutes
      mode: req.body.mode,
    
      capacity: parseInt(req.body.capacity),
      status: 'scheduled',
      registeredUsers: []
    };

    // Mode-specific validation and fields
    if (lectureData.mode === 'online') {
      if (!req.body.meetLink) {
        throw new CustomError('Meeting link is required for online lectures', StatusCodes.BAD_REQUEST);
      }
      lectureData.meetLink = req.body.meetLink.trim();
    } else if (lectureData.mode === 'offline') {
      if (!req.body.venue) {
        throw new CustomError('Venue is required for offline lectures', StatusCodes.BAD_REQUEST);
      }
      lectureData.venue = req.body.venue.trim();
    }

    // Validate department
    
    // Validate and process capacity
    if (isNaN(lectureData.capacity) || lectureData.capacity < 1) {
      throw new CustomError('Capacity must be a positive number', StatusCodes.BAD_REQUEST);
    }

    // Process prerequisites if provided
    if (req.body.prerequisites) {
      lectureData.prerequisites = typeof req.body.prerequisites === 'string' 
        ? req.body.prerequisites.split(',').map(p => p.trim()).filter(p => p.length > 0)
        : req.body.prerequisites;
    }

    // Process tags if provided
    if (req.body.tags) {
      lectureData.tags = typeof req.body.tags === 'string'
        ? req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : req.body.tags;
    }

    const lecture = await Lecture.create(lectureData);
    
    // Populate instructor details for the response
    await lecture.populate('instructor', 'name email');

    // Return formatted response
    res.status(StatusCodes.CREATED).json({
      message: 'Lecture created successfully',
      lecture: {
        id: lecture._id,
        title: lecture.title,
        description: lecture.description,
        instructor: lecture.instructor.name,
        date: lecture.date,
        time: lecture.time,
        mode: lecture.mode,
        venue: lecture.venue,
        meetLink: lecture.meetLink,
        capacity: lecture.capacity,
        
        prerequisites: lecture.prerequisites,
        tags: lecture.tags,
        registeredCount: 0,
        status: lecture.status
      }
    });
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(
      error.message || 'Failed to create lecture',
      error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
// Register for a lecture
const registerForLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.user.userId;

    const lecture = await Lecture.findById(lectureId);
    
    if (!lecture) {
      throw new CustomError('Lecture not found', StatusCodes.NOT_FOUND);
    }

    if (!lecture.isRegistrationOpen()) {
      throw new CustomError('Registration is closed for this lecture', StatusCodes.BAD_REQUEST);
    }

    if (lecture.registeredUsers.includes(userId)) {
      throw new CustomError('Already registered for this lecture', StatusCodes.BAD_REQUEST);
    }

    lecture.registeredUsers.push(userId);
    await lecture.save();

    res.status(StatusCodes.OK).json({
      id: lecture._id,
      title: lecture.title,
      description: lecture.description,
      date: lecture.date,
      time: lecture.time,
      mode: lecture.mode,
      venue: lecture.venue,
      meetLink: lecture.meetLink,
      capacity: lecture.capacity,
      registeredCount: lecture.registeredUsers.length,
     
      tags: lecture.tags,
      isRegistered: true
    });
  } catch (error) {
    throw new CustomError(error.message, error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getUpcomingLectures,
  getPastLectures,
  getScheduledTalks,
  createLecture,
  registerForLecture
};