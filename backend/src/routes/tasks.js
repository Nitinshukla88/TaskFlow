const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const List = require('../models/List');
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

// Create task
router.post('/', [auth, body('title').notEmpty().trim(), body('listId').notEmpty()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { title, description, listId, assignedTo, labels, dueDate } = req.body;
    const list = await List.findById(listId);
    
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const board = await Board.findById(list.board);
    const hasAccess = board.owner.equals(req.userId) || 
                     board.members.some(m => m.equals(req.userId));
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const lastTask = await Task.findOne({ list: listId }).sort('-position');
    const position = lastTask ? lastTask.position + 1 : 0;

    const task = new Task({
      title,
      description,
      list: listId,
      board: list.board,
      assignedTo: assignedTo || [],
      labels: labels || [],
      dueDate,
      position,
      createdBy: req.userId
    });

    await task.save();
    await task.populate('assignedTo', 'username email avatar');
    await task.populate('createdBy', 'username email avatar');
    await logActivity(list.board, req.userId, 'task_created', 'task', task._id, { title }, req.io);

    res.status(201).json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'username email avatar')
      .populate('createdBy', 'username email avatar');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const board = await Board.findById(task.board);
    const hasAccess = board.owner.equals(req.userId) || 
                     board.members.some(m => m.equals(req.userId));
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const board = await Board.findById(task.board);
    const hasAccess = board.owner.equals(req.userId) || 
                     board.members.some(m => m.equals(req.userId));
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, description, assignedTo, labels, dueDate, completed, position } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo) task.assignedTo = assignedTo;
    if (labels) task.labels = labels;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (completed !== undefined) task.completed = completed;
    if (position !== undefined) task.position = position;

    await task.save();
    await task.populate('assignedTo', 'username email avatar');
    await task.populate('createdBy', 'username email avatar');
    await logActivity(task.board, req.userId, 'task_updated', 'task', task._id, { title: task.title }, req.io);

    res.json({ task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Move task
router.put('/:id/move', [auth, body('listId').notEmpty(), body('position').isNumeric()], async (req, res) => {
  try {
    const { listId, position } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const board = await Board.findById(task.board);
    const hasAccess = board.owner.equals(req.userId) || 
                     board.members.some(m => m.equals(req.userId));
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newList = await List.findById(listId);
    if (!newList || !newList.board.equals(task.board)) {
      return res.status(400).json({ error: 'Invalid list' });
    }

    const oldListId = task.list;
    task.list = listId;
    task.position = position;

    await task.save();
    await task.populate('assignedTo', 'username email avatar');
    await task.populate('createdBy', 'username email avatar');
    await logActivity(task.board, req.userId, 'task_moved', 'task', task._id, {
      title: task.title,
      fromList: oldListId,
      toList: listId
    }, req.io);

    res.json({ task });
  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const board = await Board.findById(task.board);
    const hasAccess = board.owner.equals(req.userId) || 
                     board.members.some(m => m.equals(req.userId));
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await logActivity(task.board, req.userId, 'task_deleted', 'task', task._id, { title: task.title }, req.io);
    await Task.findByIdAndDelete(task._id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search tasks
router.get('/board/:boardId/search', auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const boardId = req.params.boardId;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const hasAccess = board.owner.equals(req.userId) || 
                     board.members.some(m => m.equals(req.userId));
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let query = { board: boardId };
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'username email avatar')
      .populate('createdBy', 'username email avatar')
      .populate('list', 'title')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-updatedAt');

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Search tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reorder tasks
router.put('/reorder/positions', auth, async (req, res) => {
  try {
    const { taskPositions } = req.body;
    
    if (!Array.isArray(taskPositions)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const updatePromises = taskPositions.map(({ taskId, listId, position }) => 
      Task.findByIdAndUpdate(taskId, { list: listId, position })
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;