const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  // Basic lecture information
  title: {
    type: String,
    required: [true, 'Please provide a title for the lecture'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  instructor: {
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
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Additional information
  department: {
    type: String,
    required: [true, 'Please specify the department'],
    enum: ['CSE', 'ECE', 'MME', 'CCE']
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  
  // Post-lecture content
  recording: {
    type: String,
    trim: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
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

// Virtual field for registered users count
lectureSchema.virtual('registeredCount').get(function() {
  return this.registeredUsers.length;
});

// Index for efficient queries
lectureSchema.index({ date: 1, status: 1 });
lectureSchema.index({ instructor: 1 });
lectureSchema.index({ department: 1 });

// Methods to check lecture status
lectureSchema.methods.isRegistrationOpen = function() {
  return this.registeredUsers.length < this.capacity && 
         this.status === 'scheduled' && 
         new Date(this.date) > new Date();
};

const Lecture = mongoose.model('Lecture', lectureSchema);
module.exports = Lecture;