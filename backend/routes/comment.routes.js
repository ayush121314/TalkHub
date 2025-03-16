const express = require('express');
const router = express.Router();
const {
  getLectureComments,
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/comment.controller');
const authMiddleware = require('../middleware/auth');

// Routes with auth middleware
router.get('/lecture/:lectureId', getLectureComments);
router.post('/lecture/:lectureId', authMiddleware, createComment);
router.patch('/:commentId', authMiddleware, updateComment);
router.delete('/:commentId', authMiddleware, deleteComment);

module.exports = router; 