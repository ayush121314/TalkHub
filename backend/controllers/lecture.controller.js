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
      duration: lecture.duration || 60, // Add duration with default value
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
      date: { $lt: currentDate }
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
      duration: lecture.duration || 60, // Add duration with default value
      mode: lecture.mode,
      venue: lecture.venue,
      meetLink: lecture.meetLink,
      capacity: lecture.capacity,
      registeredCount: lecture.registeredUsers.length,
      tags: lecture.tags,
      recording: lecture.recording,
      isRegistered: lecture.registeredUsers.includes(req.user.userId)
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
      duration: lecture.duration || 60, // Add duration with default value
      mode: lecture.mode,
      venue: lecture.venue,
      meetLink: lecture.meetLink,
      capacity: lecture.capacity,
      registeredCount: lecture.registeredUsers.length,
      tags: lecture.tags,
      isRegistered: lecture.registeredUsers.includes(req.user.userId)
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

    // Validate date and time
    const lectureDate = new Date(req.body.date);
    const currentDate = new Date();

    if (lectureDate.toDateString() === currentDate.toDateString()) {
      // If the date is today, validate the time
      const [lectureHour, lectureMinute] = req.body.time.split(':').map(Number);
      const lectureTime = new Date(
        lectureDate.getFullYear(),
        lectureDate.getMonth(),
        lectureDate.getDate(),
        lectureHour,
        lectureMinute
      );

      if (lectureTime <= currentDate) {
        throw new CustomError(
          'Lecture time must be in the future if the date is today',
          StatusCodes.BAD_REQUEST
        );
      }
    } else if (lectureDate < currentDate) {
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

const getLectureById = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate({
        path: 'instructor',
        select: 'name email role profile'
      })
      .populate('registeredUsers', 'name email');
    
    if (!lecture) {
      throw new CustomError('Lecture not found', StatusCodes.NOT_FOUND);
    }

    // Helper function to get instructor title
    const getInstructorTitle = (role) => {
      switch (role) {
        case 'professor':
          return 'Professor';
        case 'student':
          return 'Student Instructor';
        default:
          return 'Instructor';
      }
    };

    // Transform data to match frontend requirements
    const transformedLecture = {
      id: lecture._id,
      title: lecture.title,
      description: lecture.description,
      instructor: {
        id: lecture.instructor._id,
        name: lecture.instructor.name,
        email: lecture.instructor.email,
        role: lecture.instructor.role,
        title: getInstructorTitle(lecture.instructor.role),
        profile: {
          profilePic: lecture.instructor.profile?.profilePic || null,
          linkedinProfile: lecture.instructor.profile?.linkedinProfile || null,
          personalWebsite: lecture.instructor.profile?.personalWebsite || null,
          organization: lecture.instructor.profile?.organization || null,
          speakerBio: lecture.instructor.profile?.speakerBio || null,
          socialMediaHandle1: lecture.instructor.profile?.socialMediaHandle1 || null,
          socialMediaHandle2: lecture.instructor.profile?.socialMediaHandle2 || null,
          additionalInfo: lecture.instructor.profile?.additionalInfo || null
        }
      },
      date: lecture.date,
      time: lecture.time,
      duration: lecture.duration,
      mode: lecture.mode,
      venue: lecture.venue,
      meetLink: lecture.meetLink,
      capacity: lecture.capacity,
      prerequisites: lecture.prerequisites,
      tags: lecture.tags,
      status: lecture.status,
      recording: lecture.recording,
      registeredUsers: lecture.registeredUsers.map(user => user._id)
    };

    res.status(StatusCodes.OK).json(transformedLecture);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to fetch lecture details', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Register for lecture
const registerForLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    
    if (!lecture) {
      throw new CustomError('Lecture not found', StatusCodes.NOT_FOUND);
    }

    // Check if lecture is still open for registration
    if (lecture.status !== 'scheduled') {
      throw new CustomError('Lecture is not open for registration', StatusCodes.BAD_REQUEST);
    }

    // Check if lecture date hasn't passed
    if (new Date(lecture.date) < new Date()) {
      throw new CustomError('Cannot register for past lectures', StatusCodes.BAD_REQUEST);
    }

    // Check capacity
    if (lecture.registeredUsers.length >= lecture.capacity) {
      throw new CustomError('Lecture is at full capacity', StatusCodes.BAD_REQUEST);
    }

    // Check if user is already registered
    if (lecture.registeredUsers.includes(req.user.userId)) {
      throw new CustomError('Already registered for this lecture', StatusCodes.BAD_REQUEST);
    }

    // Register user
    lecture.registeredUsers.push(req.user.userId);
    await lecture.save();

    // Return updated lecture details with full instructor profile
    await lecture.populate({
      path: 'instructor',
      select: 'name email role profile'
    });
    
    // Helper function to get instructor title
    const getInstructorTitle = (role) => {
      switch (role) {
        case 'professor':
          return 'Professor';
        case 'student':
          return 'Student Instructor';
        default:
          return 'Instructor';
      }
    };
    
    const transformedLecture = {
      id: lecture._id,
      title: lecture.title,
      description: lecture.description,
      instructor: {
        id: lecture.instructor._id,
        name: lecture.instructor.name,
        email: lecture.instructor.email,
        role: lecture.instructor.role,
        title: getInstructorTitle(lecture.instructor.role),
        profile: {
          profilePic: lecture.instructor.profile?.profilePic || null,
          linkedinProfile: lecture.instructor.profile?.linkedinProfile || null,
          personalWebsite: lecture.instructor.profile?.personalWebsite || null,
          organization: lecture.instructor.profile?.organization || null,
          speakerBio: lecture.instructor.profile?.speakerBio || null,
          socialMediaHandle1: lecture.instructor.profile?.socialMediaHandle1 || null,
          socialMediaHandle2: lecture.instructor.profile?.socialMediaHandle2 || null,
          additionalInfo: lecture.instructor.profile?.additionalInfo || null
        }
      },
      date: lecture.date,
      time: lecture.time,
      duration: lecture.duration,
      mode: lecture.mode,
      venue: lecture.venue,
      meetLink: lecture.meetLink,
      capacity: lecture.capacity,
      prerequisites: lecture.prerequisites,
      tags: lecture.tags,
      status: lecture.status,
      registeredUsers: lecture.registeredUsers,
    };

    res.status(StatusCodes.OK).json(transformedLecture);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError('Failed to register for lecture', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getUpcomingLectures,
  getPastLectures,
  getScheduledTalks,
  createLecture,
  getLectureById,
  registerForLecture,
};