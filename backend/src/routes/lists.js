const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const List = require('../models/List');
const Task = require('../models/Task');
const Board = require('../models/Board');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

const logActivity = async (board, user, action, entity, entityId, details = {}, io) => {
  try {
    const activity = await Activity.create({ board, user, action, entity, entityId, details });
    if (io) {
      io.to(`board-${board}`).emit('activity-logged', { activity });
    }
  } catch (error) {
    console.error('Activity log error:', error);
  }
};

router.post('/', [auth, body('title').notEmpty().trim(), body('boardId').notEmpty()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { title, boardId } = req.body;
    const board = await Board.findById(boardId);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const hasAccess = board.owner.equals(req.userId) || 
                     board.members.some(m => m.equals(req.userId));
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const lastList = await List.findOne({ board: boardId }).sort('-position');
    const position = lastList ? lastList.position + 1 : 0;

    const list = new List({ title, board: boardId, position });
    await list.save();
    await logActivity(boardId, req.userId, 'list_created', 'list', list._id, { title }, req.io);

    res.status(201).json({ list });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', [auth, body('title').optional().notEmpty().trim()], async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const board = await Board.findById(list.board);
    const hasAccess = board.owner.equals(req.userId) || 
                     board.members.some(m => m.equals(req.userId));
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, position } = req.body;
    if (title) list.title = title;
    if (position !== undefined) list.position = position;

    await list.save();
    await logActivity(list.board, req.userId, 'list_updated', 'list', list._id, { title: list.title }, req.io);

    res.json({ list });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const board = await Board.findById(list.board);
    const hasAccess = board.owner.equals(req.userId) || 
                     board.members.some(m => m.equals(req.userId));
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Task.deleteMany({ list: list._id });
    await logActivity(list.board, req.userId, 'list_deleted', 'list', list._id, { title: list.title }, req.io);
    await List.findByIdAndDelete(list._id);

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/reorder/positions', auth, async (req, res) => {
  try {
    const { listPositions } = req.body;
    
    if (!Array.isArray(listPositions)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const updatePromises = listPositions.map(({ listId, position }) => 
      List.findByIdAndUpdate(listId, { position })
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Lists reordered successfully' });
  } catch (error) {
    console.error('Reorder lists error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;