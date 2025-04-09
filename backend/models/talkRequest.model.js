const mongoose = require('mongoose');

const talkRequestSchema = new mongoose.Schema({
  // Basic talk information
  title: {
    type: String,
    required: [true, 'Please provide a title for the talk'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Scheduling information
  date: {
    type: Date,
    required: [true, 'Please provide a date']
  },
  time: {
    type: String,
    required: [true, 'Please provide a time']
  },
  duration: {
    type: Number,
    default: 60, // Duration in minutes
    required: true
  },
  
  // Location/Mode details
  mode: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  venue: {
    type: String,
    required: function() { return this.mode === 'offline'; }
  },
  meetLink: {
    type: String,
    required: function() { return this.mode === 'online'; }
  },
  
  // Attendance and capacity
  capacity: {
    type: Number,
    required: [true, 'Please specify the capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  
  // Additional information
  prerequisites: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  
  // Materials for the talk
  materials: {
    type: String,
    trim: true
  },
  
  // Approval workflow
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Admin feedback/message
  adminMessage: {
    type: String,
    trim: true
  },
  
  // Reference to created lecture if approved
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
talkRequestSchema.index({ status: 1 });
talkRequestSchema.index({ requestedBy: 1 });
talkRequestSchema.index({ date: 1 });

const TalkRequest = mongoose.model('TalkRequest', talkRequestSchema);
module.exports = TalkRequest; 