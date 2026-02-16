const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

const logActivity = async (board, user, action, entity, entityId, details = {}, io) => {
  try {
    const activity = await Activity.create({ board, user, action, entity, entityId, details });
    // Emit socket event to board members
    if (io) {
      io.to(`board-${board}`).emit('activity-logged', { activity });
    }
  } catch (error) {
    console.error('Activity log error:', error);
  }
};

// Get all boards
router.get('/', auth, async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [{ owner: req.userId }, { members: req.userId }]
    })
    .populate('owner', 'username email avatar')
    .populate('members', 'username email avatar')
    .sort('-updatedAt');

    res.json({ boards });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single board with lists and tasks
router.get('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'username email avatar')
      .populate('members', 'username email avatar');

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const hasAccess = board.owner._id.equals(req.userId) || 
                     board.members.some(m => m._id.equals(req.userId));
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const lists = await List.find({ board: board._id }).sort('position');
    const tasks = await Task.find({ board: board._id })
      .populate('assignedTo', 'username email avatar')
      .populate('createdBy', 'username email avatar')
      .sort('position');

    res.json({ board, lists, tasks });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create board
router.post('/', [auth, body('title').notEmpty().trim()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { title, description, background } = req.body;
    const board = new Board({
      title,
      description,
      background,
      owner: req.userId,
      members: [req.userId]
    });

    await board.save();
    await board.populate('owner', 'username email avatar');
    await board.populate('members', 'username email avatar');
    await logActivity(board._id, req.userId, 'board_created', 'board', board._id, { title }, req.io);

    res.status(201).json({ board });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update board
router.put('/:id', [auth, body('title').optional().notEmpty().trim()], async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const hasAccess = board.owner.equals(req.userId) || 
                     board.members.some(m => m.equals(req.userId));
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, description, background } = req.body;
    if (title) board.title = title;
    if (description !== undefined) board.description = description;
    if (background) board.background = background;

    await board.save();
    await board.populate('owner', 'username email avatar');
    await board.populate('members', 'username email avatar');
    await logActivity(board._id, req.userId, 'board_updated', 'board', board._id, { title: board.title }, req.io);

    res.json({ board });
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete board
router.delete('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (!board.owner.equals(req.userId)) {
      return res.status(403).json({ error: 'Only owner can delete board' });
    }

    await List.deleteMany({ board: board._id });
    await Task.deleteMany({ board: board._id });
    await Activity.deleteMany({ board: board._id });
    await logActivity(board._id, req.userId, 'board_deleted', 'board', board._id, { title: board.title }, req.io);
    await Board.findByIdAndDelete(board._id);

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add member
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (!board.owner.equals(req.userId)) {
      return res.status(403).json({ error: 'Only owner can add members' });
    }

    if (board.members.includes(userId)) {
      return res.status(400).json({ error: 'User already a member' });
    }

    board.members.push(userId);
    await board.save();
    await board.populate('members', 'username email avatar');
    await logActivity(board._id, req.userId, 'member_added', 'member', userId, {}, req.io);

    res.json({ board });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove member
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (!board.owner.equals(req.userId)) {
      return res.status(403).json({ error: 'Only owner can remove members' });
    }

    board.members = board.members.filter(m => !m.equals(req.params.userId));
    await board.save();
    await board.populate('members', 'username email avatar');
    await logActivity(board._id, req.userId, 'member_removed', 'member', req.params.userId, {}, req.io);

    res.json({ board });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get activities
router.get('/:id/activities', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const hasAccess = board.owner.equals(req.userId) || 
                     board.members.some(m => m.equals(req.userId));
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const activities = await Activity.find({ board: board._id })
      .populate('user', 'username email avatar')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments({ board: board._id });

    res.json({
      activities,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;