require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

// Socket.IO configuration
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/boards', require('./routes/boards'));
app.use('/api/lists', require('./routes/lists'));
app.use('/api/tasks', require('./routes/tasks'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Task Collaboration Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      boards: '/api/boards',
      lists: '/api/lists',
      tasks: '/api/tasks'
    }
  });
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Join board room
  socket.on('join-board', (boardId) => {
    socket.join(`board-${boardId}`);
    console.log(`User ${socket.userId} joined board ${boardId}`);
  });

  // Leave board room
  socket.on('leave-board', (boardId) => {
    socket.leave(`board-${boardId}`);
    console.log(`User ${socket.userId} left board ${boardId}`);
  });

  // Board events
  socket.on('board-updated', (data) => {
    socket.to(`board-${data.boardId}`).emit('board-updated', data);
  });

  socket.on('board-deleted', (data) => {
    io.to(`board-${data.boardId}`).emit('board-deleted', data);
  });

  // List events
  socket.on('list-created', (data) => {
    socket.to(`board-${data.boardId}`).emit('list-created', data);
  });

  socket.on('list-updated', (data) => {
    socket.to(`board-${data.boardId}`).emit('list-updated', data);
  });

  socket.on('list-deleted', (data) => {
    socket.to(`board-${data.boardId}`).emit('list-deleted', data);
  });

  socket.on('lists-reordered', (data) => {
    socket.to(`board-${data.boardId}`).emit('lists-reordered', data);
  });

  // Task events
  socket.on('task-created', (data) => {
    socket.to(`board-${data.boardId}`).emit('task-created', data);
  });

  socket.on('task-updated', (data) => {
    socket.to(`board-${data.boardId}`).emit('task-updated', data);
  });

  socket.on('task-deleted', (data) => {
    socket.to(`board-${data.boardId}`).emit('task-deleted', data);
  });

  socket.on('task-moved', (data) => {
    socket.to(`board-${data.boardId}`).emit('task-moved', data);
  });

  socket.on('tasks-reordered', (data) => {
    socket.to(`board-${data.boardId}`).emit('tasks-reordered', data);
  });

  // Member events
  socket.on('member-added', (data) => {
    io.to(`board-${data.boardId}`).emit('member-added', data);
  });

  socket.on('member-removed', (data) => {
    io.to(`board-${data.boardId}`).emit('member-removed', data);
  });

  // Activity events
  socket.on('activity-logged', (data) => {
    socket.to(`board-${data.boardId}`).emit('activity-logged', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Make io accessible in routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB connected successfully');
    console.log(`Database: ${mongoose.connection.name}`);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, io, server };