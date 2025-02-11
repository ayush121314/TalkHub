const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/auth.middleware');

// Import the profile controller
const profileController = require('../controllers/profile.controller');
router.use(authMiddleware);

// Basic route
router.get('/', (req, res) => {
  res.send('User route working!');
});

// Profile routes
router.get('/profile', profileController.getProfile);

router.put('/profile',
  upload.single('profileImage'),
  profileController.updateProfile
);

module.exports = router;