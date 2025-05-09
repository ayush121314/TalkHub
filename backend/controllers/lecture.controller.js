const Lecture = require('../models/lecture.model');
const TalkRequest = require('../models/talkRequest.model');
const User = require('../models/User');
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
    // Get approved lectures by this user
    const lectures = await Lecture.find({
      instructor: req.user.userId,
      status: { $in: ['scheduled', 'ongoing'] }
    }).sort({ date: 1 });

    // Get pending and rejected talk requests by this user
    const talkRequests = await TalkRequest.find({
      requestedBy: req.user.userId,
      status: { $in: ['pending', 'rejected'] }
    }).sort({ date: 1 });

    // Transform lectures data
    const transformedLectures = lectures.map(lecture => ({
      id: lecture._id,
      title: lecture.title,
      description: lecture.description,
      date: lecture.date,
      time: lecture.time,
      duration: lecture.duration || 60,
      mode: lecture.mode,
      venue: lecture.venue,
      meetLink: lecture.meetLink,
      capacity: lecture.capacity,
      registeredCount: lecture.registeredUsers.length,
      tags: lecture.tags,
      status: 'approved',
      isRegistered: lecture.registeredUsers.includes(req.user.userId)
    }));

    // Transform talk requests data
    const transformedRequests = talkRequests.map(request => ({
      id: request._id,
      title: request.title,
      description: request.description,
      date: request.date,
      time: request.time,
      duration: request.duration || 60,
      mode: request.mode,
      venue: request.venue,
      meetLink: request.meetLink,
      capacity: request.capacity,
      tags: request.tags,
      status: request.status,
      adminMessage: request.adminMessage,
      isRequest: true
    }));

    // Combine and send both
    const combinedResults = [...transformedLectures, ...transformedRequests];
    combinedResults.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(StatusCodes.OK).json(combinedResults);
  } catch (error) {
    throw new CustomError('Failed to fetch scheduled talks', StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Create a new talk request (instead of directly creating a lecture)
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

    // Set up base talk request data
    const requestData = {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      requestedBy: req.user.userId,
      date: lectureDate,
      time: req.body.time,
      duration: parseInt(req.body.duration) || 60, // Default to 60 minutes
      mode: req.body.mode,
      capacity: parseInt(req.body.capacity),
      status: 'pending'
    };

    // Mode-specific validation and fields
    if (requestData.mode === 'online') {
      if (!req.body.meetLink) {
        throw new CustomError('Meeting link is required for online lectures', StatusCodes.BAD_REQUEST);
      }
      requestData.meetLink = req.body.meetLink.trim();
    } else if (requestData.mode === 'offline') {
      if (!req.body.venue) {
        throw new CustomError('Venue is required for offline lectures', StatusCodes.BAD_REQUEST);
      }
      requestData.venue = req.body.venue.trim();
    }

    // Validate and process capacity
    if (isNaN(requestData.capacity) || requestData.capacity < 1) {
      throw new CustomError('Capacity must be a positive number', StatusCodes.BAD_REQUEST);
    }

    // Process prerequisites if provided
    if (req.body.prerequisites) {
      requestData.prerequisites = typeof req.body.prerequisites === 'string' 
        ? req.body.prerequisites.split(',').map(p => p.trim()).filter(p => p.length > 0)
        : req.body.prerequisites;
    }

    // Process tags if provided
    if (req.body.tags) {
      requestData.tags = typeof req.body.tags === 'string'
        ? req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : req.body.tags;
    }

    // Process materials if provided
    if (req.body.materials) {
      requestData.materials = req.body.materials.trim();
    }

    // Create a new talk request instead of a lecture
    const talkRequest = await TalkRequest.create(requestData);
    
    // Populate requestedBy details for the response
    await talkRequest.populate('requestedBy', 'name email');

    // Return formatted response
    res.status(StatusCodes.CREATED).json({
      message: 'Talk request submitted successfully and is pending approval',
      talkRequest: {
        id: talkRequest._id,
        title: talkRequest.title,
        description: talkRequest.description,
        instructor: talkRequest.requestedBy.name,
        date: talkRequest.date,
        time: talkRequest.time,
        duration: talkRequest.duration,
        mode: talkRequest.mode,
        venue: talkRequest.venue,
        meetLink: talkRequest.meetLink,
        capacity: talkRequest.capacity,
        status: talkRequest.status,
        tags: talkRequest.tags,
        prerequisites: talkRequest.prerequisites,
        materials: talkRequest.materials
      }
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to submit talk request', error: error.message });
    }
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

// Search lectures based on query
const searchLectures = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        message: 'Search query is required' 
      });
    }

    //console.log(`Received search query: "${query}" from user: ${req.user.userId}`);

    // Create a case-insensitive regex pattern for the search query
    const searchPattern = new RegExp(query, 'i');
    
    // MUCH SIMPLER APPROACH: Just load all lectures with populated instructors
    // and filter in-memory - this is more reliable for small to medium datasets
    let allLectures = await Lecture.find()
      .populate('instructor', 'name email role')
      .sort({ date: -1 });
    
    //console.log(`Total lectures in the system: ${allLectures.length}`);
    
    // Filter results for all matching criteria
    const matchingLectures = allLectures.filter(lecture => {
      // Match by title, description, or tags
      const titleMatch = lecture.title && searchPattern.test(lecture.title);
      const descMatch = lecture.description && searchPattern.test(lecture.description);
      const tagsMatch = lecture.tags && lecture.tags.some(tag => searchPattern.test(tag));
      
      // Match by instructor name
      const instructorMatch = lecture.instructor && 
                             lecture.instructor.name && 
                             searchPattern.test(lecture.instructor.name);
      
      return titleMatch || descMatch || tagsMatch || instructorMatch;
    });
    
    //console.log(`Found ${matchingLectures.length} total matching lectures`);
    
    // Log the matched instructors to debug
    const instructorsInResults = matchingLectures
      .filter(l => l.instructor)
      .map(l => `${l.instructor.name} (${l.instructor.role || 'unknown role'})`)
      .filter((v, i, a) => a.indexOf(v) === i); // Get unique values
      
    //console.log(`Instructors in results: ${instructorsInResults.join(', ') || 'None'}`);

    // Transform the data to match frontend requirements
    const transformedLectures = matchingLectures.map(lecture => ({
      id: lecture._id,
      title: lecture.title,
      description: lecture.description,
      instructor: lecture.instructor ? lecture.instructor.name : 'Unknown Instructor',
      date: lecture.date,
      time: lecture.time,
      duration: lecture.duration || 60,
      mode: lecture.mode,
      venue: lecture.venue || '',
      meetLink: lecture.meetLink || '',
      capacity: lecture.capacity,
      registeredCount: lecture.registeredUsers ? lecture.registeredUsers.length : 0,
      tags: lecture.tags || [],
      isRegistered: lecture.registeredUsers ? lecture.registeredUsers.includes(req.user.userId) : false,
      isPast: new Date(lecture.date) < new Date()
    }));

    res.status(StatusCodes.OK).json(transformedLectures);
  } catch (error) {
    console.error('Search lectures error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
      message: 'Failed to search lectures', 
      error: error.message 
    });
  }
};

module.exports = {
  getUpcomingLectures,
  getPastLectures,
  getScheduledTalks,
  createLecture,
  getLectureById,
  registerForLecture,
  searchLectures
};