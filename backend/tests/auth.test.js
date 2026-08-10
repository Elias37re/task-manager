const request = require('supertest');
const app = require('../server');
const db = require('../config/db');

jest.mock('../config/db', () => {
  return {
    query: jest.fn()
  };
});

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock db.query for userCheck (no user found)
      db.query.mockResolvedValueOnce({ rows: [] });
      // Mock db.query for insert user
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          username: 'testuser',
          email: 'testuser@example.com',
          created_at: new Date()
        }]
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.username).toEqual('testuser');
      expect(db.query).toHaveBeenCalledTimes(2);
    });

    it('should fail registration if fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Please enter all fields');
    });

    it('should fail if email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'notanemail',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Please enter a valid email address');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should log in an existing user successfully', async () => {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('password123', 10);

      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          username: 'testuser',
          email: 'testuser@example.com',
          password_hash: hash,
          created_at: new Date()
        }]
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toEqual('testuser@example.com');
    });

    it('should fail login if password is incorrect', async () => {
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('password123', 10);

      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          username: 'testuser',
          email: 'testuser@example.com',
          password_hash: hash,
          created_at: new Date()
        }]
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Invalid credentials');
    });
  });
});
