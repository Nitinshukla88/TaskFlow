const request = require('supertest');
const { app } = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Board = require('../models/Board');

describe('Task Collaboration Platform API Tests', () => {
  let authToken;
  let userId;
  let boardId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-collab-test');
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Board.deleteMany({});
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

    it('should not access board without authentication', async () => {
      const res = await request(app).get(`/api/boards/${boardId}`);
      expect(res.status).toBe(401);
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