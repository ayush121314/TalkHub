const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const adminMiddleware = require('../middleware/admin.middleware');

// Public route for admin login
router.post('/login', adminController.login);

// Protected admin routes - all routes below require admin middleware
router.use(adminMiddleware);

// Validate admin session
router.get('/validate-session', adminController.validateSession);

// Get dashboard statistics
router.get('/dashboard-stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);

// Lecture management
router.get('/lectures', adminController.getAllLectures);
router.post('/lectures/update-status', adminController.updateLectureStatus);

// Talk requests management
router.get('/talk-requests', adminController.getTalkRequests);
router.post('/talk-requests/approve', adminController.approveTalkRequest);
router.post('/talk-requests/reject', adminController.rejectTalkRequest);

module.exports = router; 