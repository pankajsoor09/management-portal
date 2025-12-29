const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let mongoServer;
let app;
let server;

const User = require('../src/models/User');

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  process.env.MONGODB_URI = mongoUri;
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_EXPIRE = '7d';

  const serverModule = require('../src/server');
  app = serverModule.app;
  server = serverModule.server;
});

afterAll(async () => {
  if (server) {
    server.close();
  }
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User Registration', () => {
  it('should register a new user with valid data', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'Password123',
        fullName: 'Test User',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject registration with invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'invalid-email',
        password: 'Password123',
        fullName: 'Test User',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with weak password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'weak',
        fullName: 'Test User',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject duplicate email registration', async () => {
    await User.create({
      email: 'test@example.com',
      password: 'Password123',
      fullName: 'Test User',
    });

    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'Password123',
        fullName: 'Another User',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('already');
  });
});

describe('User Login', () => {
  beforeEach(async () => {
    await User.create({
      email: 'test@example.com',
      password: 'Password123',
      fullName: 'Test User',
    });
  });

  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword123',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid');
  });

  it('should reject login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Password123',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject login for inactive user', async () => {
    await User.updateOne(
      { email: 'test@example.com' },
      { status: 'inactive' }
    );

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('deactivated');
  });
});

describe('Password Hashing', () => {
  it('should hash password before storing', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'Password123',
      fullName: 'Test User',
    });

    const userWithPassword = await User.findById(user._id).select('+password');
    expect(userWithPassword.password).not.toBe('Password123');
    expect(await bcrypt.compare('Password123', userWithPassword.password)).toBe(true);
  });
});

describe('Protected Routes', () => {
  let token;
  let user;

  beforeEach(async () => {
    user = await User.create({
      email: 'test@example.com',
      password: 'Password123',
      fullName: 'Test User',
    });
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  });

  it('should access protected route with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('test@example.com');
  });

  it('should reject access without token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject access with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('Role-Based Access Control', () => {
  let adminToken;
  let userToken;

  beforeEach(async () => {
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'Password123',
      fullName: 'Admin User',
      role: 'admin',
    });

    const regularUser = await User.create({
      email: 'user@example.com',
      password: 'Password123',
      fullName: 'Regular User',
      role: 'user',
    });

    adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
    userToken = jwt.sign({ id: regularUser._id }, process.env.JWT_SECRET);
  });

  it('should allow admin to access admin routes', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject regular user from admin routes', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
