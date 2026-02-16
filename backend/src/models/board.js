const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Board title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Board must have an owner']
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  background: {
    type: String,
    default: '#0079bf',
    match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color']
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

boardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

boardSchema.pre('save', function(next) {
  if (!this.members.includes(this.owner)) {
    this.members.push(this.owner);
  }
  next();
});

boardSchema.index({ owner: 1 });
boardSchema.index({ members: 1 });
boardSchema.index({ title: 1 });
boardSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Board', boardSchema);