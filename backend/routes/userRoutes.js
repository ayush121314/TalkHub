const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/auth.middleware');
const profileMiddleware = require('../middleware/profile.middleware');

// Import the profile controller
const profileController = require('../controllers/profile.controller');

// Basic route
router.get('/',authMiddleware, (req, res) => {
  res.send('User route working!');
});

// Profile routes
router.get('/profile',profileMiddleware, profileController.getProfile);

router.put('/profile',
  profileMiddleware,
  upload.single('profileImage'),
  profileController.updateProfile
);

module.exports = router;