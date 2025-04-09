const User = require('../models/User');
const Lecture = require('../models/lecture.model');
const TalkRequest = require('../models/talkRequest.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const adminController = {
  // Admin login - similar to regular login but checks for admin role
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check if user is an admin
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin privileges required' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Validate admin session
  validateSession: async (req, res) => {
    // The adminMiddleware has already verified the admin status
    // Just return the user information from the request
    res.json({
      user: {
        id: req.user.userId,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  },

  // Get admin dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      // Get total users count
      const totalUsers = await User.countDocuments();
      
      // Get users by role
      const studentCount = await User.countDocuments({ role: 'student' });
      const professorCount = await User.countDocuments({ role: 'professor' });
      const adminCount = await User.countDocuments({ role: 'admin' });
      
      // Get total lectures count
      const totalLectures = await Lecture.countDocuments();
      
      // Get active lectures (lectures with future date)
      const activeLectures = await Lecture.countDocuments({
        date: { $gte: new Date() }
      });
      
      // Get pending lecture requests
      const pendingRequests = await TalkRequest.countDocuments({
        status: 'pending'
      });
      
      // Get recent lectures (last 5)
      const recentLectures = await Lecture.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('instructor', 'name email')
        .select('title date status');
      
      // Get recent user registrations (last 5)
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt');
      
      // Get recent talk requests (last 5)
      const recentRequests = await TalkRequest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('requestedBy', 'name email')
        .select('title date status');
      
      res.json({
        stats: {
          users: {
            total: totalUsers,
            students: studentCount,
            professors: professorCount,
            admins: adminCount
          },
          lectures: {
            total: totalLectures,
            active: activeLectures,
            pending: pendingRequests
          }
        },
        recentActivity: {
          lectures: recentLectures,
          users: recentUsers,
          requests: recentRequests
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 });
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get all lectures with details
  getAllLectures: async (req, res) => {
    try {
      const lectures = await Lecture.find()
        .populate('instructor', 'name email')
        .sort({ date: -1 });
      
      res.json(lectures);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get all talk requests (with various filter options)
  getTalkRequests: async (req, res) => {
    try {
      const { status } = req.query;
      
      // Build query based on filters
      const query = {};
      if (status) {
        query.status = status;
      }
      
      const requests = await TalkRequest.find(query)
        .populate('requestedBy', 'name email')
        .sort({ createdAt: -1 });
      
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Approve a talk request - creates an actual lecture
  approveTalkRequest: async (req, res) => {
    try {
      const { requestId, message } = req.body;
      
      const talkRequest = await TalkRequest.findById(requestId)
        .populate('requestedBy', 'name email');
      
      if (!talkRequest) {
        return res.status(404).json({ message: 'Talk request not found' });
      }
      
      if (talkRequest.status !== 'pending') {
        return res.status(400).json({ message: `This request has already been ${talkRequest.status}` });
      }
      
      // Create a new lecture based on the request
      const lectureData = {
        title: talkRequest.title,
        description: talkRequest.description,
        instructor: talkRequest.requestedBy._id,
        date: talkRequest.date,
        time: talkRequest.time,
        duration: talkRequest.duration,
        mode: talkRequest.mode,
        venue: talkRequest.venue,
        meetLink: talkRequest.meetLink,
        capacity: talkRequest.capacity,
        prerequisites: talkRequest.prerequisites,
        tags: talkRequest.tags,
        materials: talkRequest.materials,
        status: 'scheduled',
        registeredUsers: []
      };
      
      const lecture = await Lecture.create(lectureData);
      
      // Update the talk request
      talkRequest.status = 'approved';
      talkRequest.adminMessage = message || 'Your talk request has been approved.';
      talkRequest.lecture = lecture._id;
      await talkRequest.save();
      
      res.json({
        message: 'Talk request approved successfully',
        talkRequest,
        lecture
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Reject a talk request
  rejectTalkRequest: async (req, res) => {
    try {
      const { requestId, message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Rejection reason is required' });
      }
      
      const talkRequest = await TalkRequest.findById(requestId);
      
      if (!talkRequest) {
        return res.status(404).json({ message: 'Talk request not found' });
      }
      
      if (talkRequest.status !== 'pending') {
        return res.status(400).json({ message: `This request has already been ${talkRequest.status}` });
      }
      
      // Update the talk request
      talkRequest.status = 'rejected';
      talkRequest.adminMessage = message;
      await talkRequest.save();
      
      res.json({
        message: 'Talk request rejected',
        talkRequest
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Approve or reject a lecture request
  updateLectureStatus: async (req, res) => {
    try {
      const { lectureId, status, message } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      
      const lecture = await Lecture.findById(lectureId);
      
      if (!lecture) {
        return res.status(404).json({ message: 'Lecture not found' });
      }
      
      lecture.status = status;
      if (message) {
        lecture.adminMessage = message;
      }
      
      await lecture.save();
      
      res.json({
        message: `Lecture ${status}`,
        lecture
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = adminController; 