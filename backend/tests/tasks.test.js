const request = require('supertest');
const app = require('../server');
const db = require('../config/db');

jest.mock('../config/db', () => {
  return {
    query: jest.fn()
  };
});

jest.mock('jsonwebtoken', () => {
  return {
    verify: jest.fn().mockReturnValue({ id: 1, username: 'testuser', email: 'testuser@example.com' }),
    sign: jest.fn().mockReturnValue('mockedtoken')
  };
});

describe('Tasks Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should return tasks for the authenticated user', async () => {
      const mockTasks = [
        { id: 1, user_id: 1, title: 'Task 1', description: 'Desc 1', status: 'pending', priority: 'medium', due_date: null },
        { id: 2, user_id: 1, title: 'Task 2', description: 'Desc 2', status: 'completed', priority: 'high', due_date: null }
      ];

      db.query.mockResolvedValueOnce({ rows: mockTasks });

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer validtoken');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].title).toEqual('Task 1');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM tasks WHERE user_id = $1'),
        [1]
      );
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with valid details', async () => {
      const newTask = {
        id: 1,
        user_id: 1,
        title: 'New Task',
        description: 'New Description',
        status: 'pending',
        priority: 'medium',
        due_date: null
      };

      db.query.mockResolvedValueOnce({ rows: [newTask] });

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer validtoken')
        .send({
          title: 'New Task',
          description: 'New Description'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.title).toEqual('New Task');
      expect(res.body.status).toEqual('pending');
    });

    it('should fail to create task if title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer validtoken')
        .send({
          description: 'No Title'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Title is required');
    });

    it('should fail if status is invalid', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer validtoken')
        .send({
          title: 'Task',
          status: 'invalid_status'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Invalid status value');
    });

    it('should fail if priority is invalid', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer validtoken')
        .send({
          title: 'Task',
          priority: 'extreme'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Invalid priority value');
    });

    it('should fail if due_date is invalid', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', 'Bearer validtoken')
        .send({
          title: 'Task',
          due_date: 'invalid-date-format'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Invalid due date format');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task successfully', async () => {
      // Check if task exists mock
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      // Update mock query response
      db.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          user_id: 1,
          title: 'Updated Task',
          description: 'Updated Description',
          status: 'completed',
          priority: 'high',
          due_date: null
        }]
      });

      const res = await request(app)
        .put('/api/tasks/1')
        .set('Authorization', 'Bearer validtoken')
        .send({
          title: 'Updated Task',
          status: 'completed',
          priority: 'high'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual('Updated Task');
      expect(res.body.status).toEqual('completed');
      expect(db.query).toHaveBeenCalledTimes(2);
    });

    it('should return 404 if task is not found', async () => {
      // Mock checkResult returning empty rows (not found/unauthorized)
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .put('/api/tasks/999')
        .set('Authorization', 'Bearer validtoken')
        .send({
          title: 'Task'
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Task not found or unauthorized');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task successfully', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const res = await request(app)
        .delete('/api/tasks/1')
        .set('Authorization', 'Bearer validtoken');

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Task deleted successfully');
    });

    it('should return 404 if task to delete is not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .delete('/api/tasks/999')
        .set('Authorization', 'Bearer validtoken');

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Task not found or unauthorized');
    });
  });
});
