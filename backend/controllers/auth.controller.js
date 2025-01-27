const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const otpStore = {};
const VALID_EMAIL_DOMAIN = '@lnmiit.ac.in';

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, role, otp } = req.body;

      // Validate email domain
      if (!email.endsWith(VALID_EMAIL_DOMAIN)) {
        return res.status(403).json({ message: `Unauthorized email domain. Only ${VALID_EMAIL_DOMAIN} allowed.` });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      /*
      if (!email.endsWith('@lnmiit.ac.in')) {
        return res.status(403).json({ message: 'Unauthorized email domain' });
      }*/

      // OTP validation (check if OTP matches and is valid)
      if (otpStore[email] !== otp) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
      delete otpStore[email]; // Clear OTP after validation

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role
      });

      await user.save();

      // Generate token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
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

  // Add this to your existing authController object
  validate: async (req, res) => {
    try {
      // Get token from header
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication token missing' });
      }
  
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
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
  sendOtp: async (req, res) => {
    const { email } = req.body;

    // Validate email domain
    if (!email.endsWith(VALID_EMAIL_DOMAIN)) {
      return res.status(403).json({ message: `Unauthorized email domain. Only ${VALID_EMAIL_DOMAIN} allowed.` });
    }

    const otp = crypto.randomInt(100000, 999999).toString(); // Generate OTP

    try {
      // Save OTP temporarily (you can replace this with a more persistent storage like a database)
      otpStore[email] = otp;

      // Send OTP via email using Nodemailer
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send OTP', error: error.message });
    }
  },
};

module.exports = authController;