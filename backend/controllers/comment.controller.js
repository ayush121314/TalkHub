const Comment = require('../models/Comment');
const Lecture = require('../models/lecture.model');
const { StatusCodes } = require('http-status-codes');
const { NotFoundError, BadRequestError } = require('../errors');

// Get all comments for a lecture
const getLectureComments = async (req, res) => {
  const { lectureId } = req.params;
  
  // Verify lecture exists
  const lectureExists = await Lecture.findById(lectureId);
  if (!lectureExists) {
    throw new NotFoundError(`No lecture found with id: ${lectureId}`);
  }
  
  // Get top-level comments (no parent)
  const comments = await Comment.find({ 
    lecture: lectureId,
    parentComment: null 
  })
    .populate({
      path: 'user',
      select: 'name email profile.profilePic'
    })
    .populate({
      path: 'replies',
      populate: {
        path: 'user',
        select: 'name email profile.profilePic'
      }
    })
    .sort({ createdAt: -1 });
  
  res.status(StatusCodes.OK).json({ comments });
};

// Create a new comment
const createComment = async (req, res) => {
  const { lectureId } = req.params;
  const { content, parentCommentId } = req.body;
  const userId = req.user.userId;
  
  // Verify lecture exists
  const lectureExists = await Lecture.findById(lectureId);
  if (!lectureExists) {
    throw new NotFoundError(`No lecture found with id: ${lectureId}`);
  }
  
  // If it's a reply, verify parent comment exists
  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      throw new NotFoundError(`No parent comment found with id: ${parentCommentId}`);
    }
    
    // Create the reply
    const reply = await Comment.create({
      content,
      user: userId,
      lecture: lectureId,
      parentComment: parentCommentId
    });
    
    // Add reply to parent comment's replies array
    await Comment.findByIdAndUpdate(
      parentCommentId,
      { $push: { replies: reply._id } }
    );
    
    // Populate user info before returning
    const populatedReply = await Comment.findById(reply._id).populate({
      path: 'user',
      select: 'name email profile.profilePic'
    });
    
    return res.status(StatusCodes.CREATED).json({ comment: populatedReply });
  }
  
  // Create top-level comment
  const comment = await Comment.create({
    content,
    user: userId,
    lecture: lectureId,
    parentComment: null
  });
  
  // Populate user info before returning
  const populatedComment = await Comment.findById(comment._id).populate({
    path: 'user',
    select: 'name email profile.profilePic'
  });
  
  res.status(StatusCodes.CREATED).json({ comment: populatedComment });
};

// Update a comment
const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user.userId;
  
  // Find the comment
  const comment = await Comment.findById(commentId);
  
  // Check if comment exists
  if (!comment) {
    throw new NotFoundError(`No comment found with id: ${commentId}`);
  }
  
  // Check if user is the owner of the comment
  if (comment.user.toString() !== userId) {
    throw new BadRequestError('You are not authorized to update this comment');
  }
  
  // Update the comment
  comment.content = content;
  await comment.save();
  
  // Populate user info before returning
  const updatedComment = await Comment.findById(commentId).populate({
    path: 'user',
    select: 'name email profile.profilePic'
  });
  
  res.status(StatusCodes.OK).json({ comment: updatedComment });
};

// Delete a comment
const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.userId;
  
  // Find the comment
  const comment = await Comment.findById(commentId);
  
  // Check if comment exists
  if (!comment) {
    throw new NotFoundError(`No comment found with id: ${commentId}`);
  }
  
  // Check if user is the owner of the comment
  if (comment.user.toString() !== userId) {
    throw new BadRequestError('You are not authorized to delete this comment');
  }
  
  // If it's a reply, remove it from parent's replies array
  if (comment.parentComment) {
    await Comment.findByIdAndUpdate(
      comment.parentComment,
      { $pull: { replies: commentId } }
    );
  }
  
  // If it's a parent comment, delete all replies as well
  if (comment.replies && comment.replies.length > 0) {
    await Comment.deleteMany({ _id: { $in: comment.replies } });
  }
  
  // Delete the comment
  await Comment.findByIdAndDelete(commentId);
  
  res.status(StatusCodes.OK).json({ message: 'Comment deleted successfully' });
};

module.exports = {
  getLectureComments,
  createComment,
  updateComment,
  deleteComment
}; 