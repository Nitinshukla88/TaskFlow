const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: [true, 'Activity must belong to a board']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Activity must have a user']
  },
  action: {
    type: String,
    required: [true, 'Activity must have an action'],
    enum: [
      'board_created',
      'board_updated',
      'board_deleted',
      'list_created',
      'list_updated',
      'list_deleted',
      'task_created',
      'task_updated',
      'task_deleted',
      'task_moved',
      'member_added',
      'member_removed'
    ]
  },
  entity: {
    type: String,
    required: [true, 'Activity must have an entity type'],
    enum: ['board', 'list', 'task', 'member']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient activity feed queries
activitySchema.index({ board: 1, createdAt: -1 });
activitySchema.index({ user: 1 });

module.exports = mongoose.model('Activity', activitySchema);