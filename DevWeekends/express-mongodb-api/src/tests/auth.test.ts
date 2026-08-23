const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

// Helper that registers a user and returns the created credentials.
const registerUser = async ({
  name = 'Test User',
  email = 'testuser@example.com',
  password = 'password123',
} = {}) => {
  return request(app).post('/api/auth/register').send({ name, email, password });
};

describe('Auth - Register', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await registerUser();

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.email).toBe('testuser@example.com');
      expect(res.body.data.name).toBe('Test User');
      expect(res.body.data).not.toHaveProperty('password');

      // Confirm the user was persisted (with a hashed password).
      const user = await User.findOne({ email: 'testuser@example.com' });
      expect(user).toBeTruthy();
      expect(user.password).not.toBe('password123');
    });

    it('should fail when name is missing', async () => {
      const res = await registerUser({ name: '' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Name is required');
    });

    it('should fail when email is missing', async () => {
      const res = await registerUser({ email: '' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email is required');
    });

    it('should fail when password is missing', async () => {
      const res = await registerUser({ password: '' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Password is required');
    });

    it('should fail when password is shorter than 6 characters', async () => {
      const res = await registerUser({ password: '12345' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Password must be at least 6 characters');
    });

    it('should fail when email format is invalid', async () => {
      const res = await registerUser({ email: 'not-an-email' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please provide a valid email address');
    });

    it('should fail when email is already registered', async () => {
      // First registration succeeds.
      await registerUser();

      // Second registration with the same email should be rejected.
      const res = await registerUser();
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
        // Register a known user before each login test (runs after the global
    // clearDatabase so a fresh user always exists for the assertions).
    beforeEach(async () => {
      await registerUser();
    });

    it('should log in an existing user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testuser@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.email).toBe('testuser@example.com');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should fail when email is missing', async () => {
      const res = await request(app).post('/api/auth/login').send({ password: 'password123' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email is required');
    });

    it('should fail when password is missing', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'testuser@example.com' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Password is required');
    });

    it('should fail with 401 when the email is not registered', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nouser@example.com', password: 'password123' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should fail with 401 when the password is wrong', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testuser@example.com', password: 'wrongpassword' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });
});
