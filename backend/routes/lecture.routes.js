const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
  getUpcomingLectures,
  getPastLectures,
  getScheduledTalks,
  createLecture,
  getLectureById,
  registerForLecture,
  searchLectures
} = require('../controllers/lecture.controller');

// Protect all routes with authentication
router.use(authMiddleware);

// Get lectures
router.get('/upcoming', getUpcomingLectures);
router.get('/past', getPastLectures);
router.get('/scheduled', getScheduledTalks);
router.get('/search', searchLectures);
router.get('/:id', getLectureById);

// Create lecture
router.post('/request', createLecture);

// Register for lecture
router.post('/:id/register', registerForLecture);

module.exports = router;