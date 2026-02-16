const request = require('supertest');
const { app } = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Board = require('../models/Board');
const List = require('../models/List');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

describe('Task Collaboration Platform API Tests', () => {
  let authToken;
  let userId;
  let secondUserId;
  let secondUserToken;
  let boardId;
  let listId;
  let taskId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-collab-test');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Board.deleteMany({});
    await List.deleteMany({});
    await Task.deleteMany({});
    await Activity.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Authentication Endpoints', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('username', 'testuser');
      
      authToken = res.body.token;
      userId = res.body.user._id;
    });

    it('should not register duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should login existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
    });

    it('should get current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should not get user without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should register a second user for member tests', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test2@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      secondUserToken = res.body.token;
      secondUserId = res.body.user._id;
    });

    it('should search users by query', async () => {
      const res = await request(app)
        .get('/api/auth/users/search?q=testuser')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBeGreaterThan(0);
    });
  });

  describe('Board Endpoints', () => {
    it('should create a new board', async () => {
      const res = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Board',
          description: 'Test board description',
          background: '#0079bf'
        });

      expect(res.status).toBe(201);
      expect(res.body.board).toHaveProperty('title', 'Test Board');
      boardId = res.body.board._id;
    });

    it('should get all boards for user', async () => {
      const res = await request(app)
        .get('/api/boards')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.boards)).toBe(true);
      expect(res.body.boards.length).toBeGreaterThan(0);
    });

    it('should get single board with details', async () => {
      const res = await request(app)
        .get(`/api/boards/${boardId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.board).toHaveProperty('_id', boardId);
      expect(Array.isArray(res.body.lists)).toBe(true);
      expect(Array.isArray(res.body.tasks)).toBe(true);
    });

    it('should update board', async () => {
      const res = await request(app)
        .put(`/api/boards/${boardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Board Title'
        });

      expect(res.status).toBe(200);
      expect(res.body.board).toHaveProperty('title', 'Updated Board Title');
    });

    it('should add member to board', async () => {
      const res = await request(app)
        .post(`/api/boards/${boardId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId: secondUserId });

      expect(res.status).toBe(200);
      expect(res.body.board.members.length).toBeGreaterThan(1);
    });

    it('should access board when member', async () => {
      const res = await request(app)
        .get(`/api/boards/${boardId}`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(res.status).toBe(200);
    });

    it('should not access board without authentication', async () => {
      const res = await request(app).get(`/api/boards/${boardId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('List Endpoints', () => {
    it('should create a list', async () => {
      const res = await request(app)
        .post('/api/lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test List',
          boardId: boardId
        });

      expect(res.status).toBe(201);
      expect(res.body.list).toHaveProperty('title', 'Test List');
      expect(res.body.list).toHaveProperty('board', boardId);
      listId = res.body.list._id;
    });

    it('should update list', async () => {
      const res = await request(app)
        .put(`/api/lists/${listId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated List Title' });

      expect(res.status).toBe(200);
      expect(res.body.list).toHaveProperty('title', 'Updated List Title');
    });
  });

  describe('Task Endpoints', () => {
    it('should create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test task description',
          listId: listId,
          assignedTo: [secondUserId]
        });

      expect(res.status).toBe(201);
      expect(res.body.task).toHaveProperty('title', 'Test Task');
      expect(res.body.task.assignedTo.length).toBe(1);
      taskId = res.body.task._id;
    });

    it('should get single task', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.task).toHaveProperty('_id', taskId);
      expect(res.body.task).toHaveProperty('title', 'Test Task');
    });

    it('should update task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Task Title' });

      expect(res.status).toBe(200);
      expect(res.body.task).toHaveProperty('title', 'Updated Task Title');
    });

    it('should move task to different position', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}/move`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ listId: listId, position: 1 });

      expect(res.status).toBe(200);
      expect(res.body.task).toHaveProperty('position', 1);
    });

    it('should search tasks', async () => {
      const res = await request(app)
        .get(`/api/tasks/board/${boardId}/search?q=Task`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.tasks)).toBe(true);
      expect(res.body.tasks.length).toBeGreaterThan(0);
    });

    it('should search tasks with pagination', async () => {
      const res = await request(app)
        .get(`/api/tasks/board/${boardId}/search?q=Task&page=1&limit=10`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('currentPage');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('total');
    });

    it('should delete task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Activity Endpoints', () => {
    it('should get board activities', async () => {
      const res = await request(app)
        .get(`/api/boards/${boardId}/activities`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.activities)).toBe(true);
      expect(res.body).toHaveProperty('currentPage');
      expect(res.body).toHaveProperty('totalPages');
    });

    it('should paginate activities', async () => {
      const res = await request(app)
        .get(`/api/boards/${boardId}/activities?page=1&limit=5`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.currentPage).toBe(1);
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });
});