const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: [true, 'Task must belong to a list']
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: [true, 'Task must belong to a board']
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  position: {
    type: Number,
    required: true,
    min: 0
  },
  labels: [{
    color: {
      type: String,
      match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color']
    },
    text: {
      type: String,
      maxlength: [50, 'Label text cannot exceed 50 characters']
    }
  }],
  dueDate: {
    type: Date,
    default: null
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must have a creator']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for efficient queries
taskSchema.index({ list: 1, position: 1 });
taskSchema.index({ board: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', taskSchema);