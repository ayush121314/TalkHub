const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const otpStore = {};
const resetOtpStore = {}; // Separate store for password reset OTPs
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
  
  // New functions for forgot password functionality
  
  // 1. Request password reset (send OTP)
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      
      // Validate email domain
      if (!email.endsWith(VALID_EMAIL_DOMAIN)) {
        return res.status(403).json({ message: `Unauthorized email domain. Only ${VALID_EMAIL_DOMAIN} allowed.` });
      }
      
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'No account found with this email' });
      }
      
      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      
      // Store OTP with expiry (5 minutes)
      resetOtpStore[email] = {
        otp,
        expiry: Date.now() + 5 * 60 * 1000 // 5 minutes in milliseconds
      };
      
      // Send OTP via email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset OTP',
        text: `Your password reset OTP is ${otp}. It is valid for 5 minutes. If you did not request this, please ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f9fc; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #5e35b1;">TalkHub</h1>
            </div>
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
              <p style="color: #555; font-size: 16px;">We received a request to reset your password. Your OTP code is:</p>
              <div style="background-color: #f0f4f8; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #5e35b1;">${otp}</span>
              </div>
              <p style="color: #555; font-size: 16px;">This code is valid for 5 minutes. If you did not request this password reset, please ignore this email.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #888; font-size: 14px;">
              <p>© ${new Date().getFullYear()} TalkHub. All rights reserved.</p>
            </div>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
      
      res.status(200).json({ message: 'Password reset OTP sent successfully' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // 2. Verify OTP for password reset
  verifyOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      // Check if OTP exists and is valid
      const resetData = resetOtpStore[email];
      if (!resetData) {
        return res.status(400).json({ message: 'No OTP request found', valid: false });
      }
      
      // Check if OTP has expired
      if (Date.now() > resetData.expiry) {
        delete resetOtpStore[email]; // Clean up expired OTP
        return res.status(400).json({ message: 'OTP has expired', valid: false });
      }
      
      // Check if OTP matches
      if (resetData.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP', valid: false });
      }
      
      // OTP is valid
      res.status(200).json({ message: 'OTP verified successfully', valid: true });
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // 3. Reset password with verified OTP
  resetPassword: async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      
      // Check if OTP exists and is valid
      const resetData = resetOtpStore[email];
      if (!resetData) {
        return res.status(400).json({ message: 'No OTP request found' });
      }
      
      // Check if OTP has expired
      if (Date.now() > resetData.expiry) {
        delete resetOtpStore[email]; // Clean up expired OTP
        return res.status(400).json({ message: 'OTP has expired' });
      }
      
      // Check if OTP matches
      if (resetData.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
      
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update user's password
      user.password = hashedPassword;
      await user.save();
      
      // Clean up used OTP
      delete resetOtpStore[email];
      
      // Send confirmation email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Successful',
        text: 'Your password has been reset successfully. If you did not perform this action, please contact us immediately.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f9fc; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #5e35b1;">TalkHub</h1>
            </div>
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Password Reset Successful</h2>
              <p style="color: #555; font-size: 16px;">Your password has been reset successfully.</p>
              <p style="color: #555; font-size: 16px;">If you did not initiate this password reset, please contact us immediately as your account may be compromised.</p>
              <div style="background-color: #eef2ff; padding: 15px; border-radius: 5px; margin-top: 20px;">
                <p style="color: #5e35b1; margin: 0; font-size: 14px;">For security reasons, you may want to update your password again after logging in.</p>
              </div>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #888; font-size: 14px;">
              <p>© ${new Date().getFullYear()} TalkHub. All rights reserved.</p>
            </div>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
      
      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = authController;