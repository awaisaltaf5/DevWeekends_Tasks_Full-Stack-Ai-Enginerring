const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const Task = require('../models/Task');

const createUser = async (email = 'user1@example.com', password = 'password123') => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email, password });
  return res.body.data;
};

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

describe('Tasks - Protected endpoints', () => {
  describe('Authentication (protecting the routes)', () => {
    describe('POST /api/tasks', () => {
      it('should reject creation when no Authorization header is supplied', async () => {
        const res = await request(app).post('/api/tasks').send({ title: 'No auth' });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('message');
      });

      it('should reject creation with an invalid token', async () => {
        const res = await request(app)
          .post('/api/tasks')
          .set(authHeader('invalidtoken123'))
          .send({ title: 'Invalid token' });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
      });

      it('should reject a malformed Authorization header', async () => {
        const res = await request(app)
          .post('/api/tasks')
          .set('Authorization', 'NotBearerToken')
          .send({ title: 'Malformed header' });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
      });

      it('should reject an expired token', async () => {
        const user = await createUser('expiry@example.com');
        const expiredToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '-1h',
        });
        const res = await request(app)
          .post('/api/tasks')
          .set(authHeader(expiredToken))
          .send({ title: 'Expired token task' });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
      });
    });
  });

  describe('With a valid token', () => {
    let user, token;

    beforeEach(async () => {
      user = await createUser('valid@example.com');
      token = user.token;
    });

    it('POST /api/tasks should create a task associated with the authenticated user', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set(authHeader(token))
        .send({ title: 'My task', description: 'desc' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('My task');
      expect(res.body.data.user).toBeDefined();
      expect(String(res.body.data.user)).toBe(String(user._id));
      const task = await Task.findById(res.body.data._id);
      expect(task).toBeTruthy();
      expect(String(task.user)).toBe(String(user._id));
    });

    it('GET /api/tasks should return only the authenticated user tasks', async () => {
      await request(app).post('/api/tasks').set(authHeader(token)).send({ title: 'Task A' });
      const res = await request(app).get('/api/tasks').set(authHeader(token));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].title).toBe('Task A');
    });

    it('GET /api/tasks/:id should return the task when it belongs to the user', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set(authHeader(token))
        .send({ title: 'Single task' });
      const res = await request(app)
        .get(`/api/tasks/${createRes.body.data._id}`)
        .set(authHeader(token));
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Single task');
    });

    it('PUT /api/tasks/:id should update the task when it belongs to the user', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set(authHeader(token))
        .send({ title: 'Original', completed: false });
      const res = await request(app)
        .put(`/api/tasks/${createRes.body.data._id}`)
        .set(authHeader(token))
        .send({ title: 'Updated', completed: true });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated');
      expect(res.body.data.completed).toBe(true);
    });

    it('DELETE /api/tasks/:id should delete the task when it belongs to the user', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set(authHeader(token))
        .send({ title: 'To delete' });
      const res = await request(app)
        .delete(`/api/tasks/${createRes.body.data._id}`)
        .set(authHeader(token));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(await Task.findById(createRes.body.data._id)).toBeNull();
    });
  });

  describe('Authorization - accessing another user tasks', () => {
    let owner, attacker;
    let ownerTask;

    beforeEach(async () => {
      owner = await createUser('owner@example.com');
      attacker = await createUser('attacker@example.com', 'password456');
      const res = await request(app)
        .post('/api/tasks')
        .set(authHeader(owner.token))
        .send({ title: "Owner's private task" });
      ownerTask = res.body.data;
    });

    it('GET /:id should return 403 when the token belongs to another user', async () => {
      const res = await request(app)
        .get(`/api/tasks/${ownerTask._id}`)
        .set(authHeader(attacker.token));
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('message');
    });

    it('PUT /:id should return 403 when the token belongs to another user', async () => {
      const res = await request(app)
        .put(`/api/tasks/${ownerTask._id}`)
        .set(authHeader(attacker.token))
        .send({ title: 'Hacked' });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('DELETE /:id should return 403 when the token belongs to another user', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${ownerTask._id}`)
        .set(authHeader(attacker.token));
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should not modify or delete the owner task', async () => {
      const task = await Task.findById(ownerTask._id);
      expect(task).toBeTruthy();
      expect(task.title).toBe("Owner's private task");
      expect(String(task.user)).toBe(String(owner._id));
    });

    it('GET / should not list tasks that belong to another user', async () => {
      const res = await request(app).get('/api/tasks').set(authHeader(attacker.token));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
    });
  });

  describe('Edge cases', () => {
    let token;

    beforeEach(async () => {
      token = (await createUser('edge@example.com')).token;
    });

    it('GET /:id with a non-ObjectId id returns 400', async () => {
      const res = await request(app)
        .get('/api/tasks/not-a-valid-id')
        .set(authHeader(token));
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});