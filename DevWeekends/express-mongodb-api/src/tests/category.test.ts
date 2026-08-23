const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const Category = require('../models/Category');

const createUser = async (email = 'user1@example.com', password = 'password123') => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email, password });
  return res.body.data;
};

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

describe('Categories - Protected endpoints', () => {
  describe('Authentication (protecting the routes)', () => {
    describe('POST /api/categories', () => {
      it('should reject creation when no Authorization header is supplied', async () => {
        const res = await request(app).post('/api/categories').send({ name: 'No auth' });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('message');
      });

      it('should reject creation with an invalid token', async () => {
        const res = await request(app)
          .post('/api/categories')
          .set(authHeader('invalidtoken123'))
          .send({ name: 'Invalid token' });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
      });

      it('should reject a malformed Authorization header', async () => {
        const res = await request(app)
          .post('/api/categories')
          .set('Authorization', 'NotBearerToken')
          .send({ name: 'Malformed header' });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
      });

      it('should reject an expired token', async () => {
        const user = await createUser('expiry-cat@example.com');
        const expiredToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '-1h',
        });
        const res = await request(app)
          .post('/api/categories')
          .set(authHeader(expiredToken))
          .send({ name: 'Expired token category' });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
      });
    });
  });

  describe('With a valid token', () => {
    let user, token;

    beforeEach(async () => {
      user = await createUser('valid-cat@example.com');
      token = user.token;
    });

    it('POST /api/categories should create a category associated with the authenticated user', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set(authHeader(token))
        .send({ name: 'Work', description: 'Work items' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Work');
      expect(res.body.data.user).toBeDefined();
      expect(String(res.body.data.user)).toBe(String(user._id));
      const category = await Category.findById(res.body.data._id);
      expect(category).toBeTruthy();
      expect(String(category.user)).toBe(String(user._id));
    });

    it('POST /api/categories should fail when name is missing', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set(authHeader(token))
        .send({ description: 'No name' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Name is required');
    });

    it('GET /api/categories should return only the authenticated user categories', async () => {
      await request(app).post('/api/categories').set(authHeader(token)).send({ name: 'Category A' });
      const res = await request(app).get('/api/categories').set(authHeader(token));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].name).toBe('Category A');
    });

    it('GET /api/categories/:id should return the category when it belongs to the user', async () => {
      const createRes = await request(app)
        .post('/api/categories')
        .set(authHeader(token))
        .send({ name: 'Personal', description: 'Personal items' });
      const res = await request(app)
        .get(`/api/categories/${createRes.body.data._id}`)
        .set(authHeader(token));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Personal');
    });

    it('PUT /api/categories/:id should update the category when it belongs to the user', async () => {
      const createRes = await request(app)
        .post('/api/categories')
        .set(authHeader(token))
        .send({ name: 'Original', description: 'desc' });
      const res = await request(app)
        .put(`/api/categories/${createRes.body.data._id}`)
        .set(authHeader(token))
        .send({ name: 'Updated', description: 'new desc' });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated');
      expect(res.body.data.description).toBe('new desc');
    });

    it('DELETE /api/categories/:id should delete the category when it belongs to the user', async () => {
      const createRes = await request(app)
        .post('/api/categories')
        .set(authHeader(token))
        .send({ name: 'To delete' });
      const res = await request(app)
        .delete(`/api/categories/${createRes.body.data._id}`)
        .set(authHeader(token));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(await Category.findById(createRes.body.data._id)).toBeNull();
    });
  });

  describe('Authorization - accessing another user categories', () => {
    let owner, attacker;
    let ownerCategory;

    beforeEach(async () => {
      owner = await createUser('owner-cat@example.com');
      attacker = await createUser('attacker-cat@example.com', 'password456');
      const res = await request(app)
        .post('/api/categories')
        .set(authHeader(owner.token))
        .send({ name: "Owner's private category" });
      ownerCategory = res.body.data;
    });

    it('GET /:id should return 403 when the token belongs to another user', async () => {
      const res = await request(app)
        .get(`/api/categories/${ownerCategory._id}`)
        .set(authHeader(attacker.token));
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('message');
    });

    it('PUT /:id should return 403 when the token belongs to another user', async () => {
      const res = await request(app)
        .put(`/api/categories/${ownerCategory._id}`)
        .set(authHeader(attacker.token))
        .send({ name: 'Hacked' });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('DELETE /:id should return 403 when the token belongs to another user', async () => {
      const res = await request(app)
        .delete(`/api/categories/${ownerCategory._id}`)
        .set(authHeader(attacker.token));
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should not modify or delete the owner category', async () => {
      const category = await Category.findById(ownerCategory._id);
      expect(category).toBeTruthy();
      expect(category.name).toBe("Owner's private category");
      expect(String(category.user)).toBe(String(owner._id));
    });

    it('GET / should not list categories that belong to another user', async () => {
      const res = await request(app).get('/api/categories').set(authHeader(attacker.token));
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
    });
  });

  describe('Edge cases', () => {
    let token;

    beforeEach(async () => {
      token = (await createUser('edge-cat@example.com')).token;
    });

    it('GET /:id with a non-ObjectId id returns 400', async () => {
      const res = await request(app)
        .get('/api/categories/not-a-valid-id')
        .set(authHeader(token));
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});


