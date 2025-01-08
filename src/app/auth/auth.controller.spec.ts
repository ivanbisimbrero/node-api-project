import 'reflect-metadata';
import request from 'supertest';
import express from 'express';
import { Container } from 'typedi';

// Import classes
import { DatabaseService } from '../../database/database.service';
import { config } from '../../config/environment';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import morgan from 'morgan';
import { AuthController } from './auth.controller';
import { DatabaseTestService } from '../../database/database.test.service';

describe('AuthController Integration Test', () => {
  let app: express.Express;
  let databaseService: DatabaseService;
  let databaseTestService: DatabaseTestService;

  beforeEach(async () => {
    // Set database to in-memory for testing
    config.dbOptions.database = ':memory:';

    // Clear and reset container
    Container.reset();

    // Register services
    databaseTestService = Container.get(DatabaseTestService);
    await databaseTestService.dumpDatabase();

    databaseService = Container.get(DatabaseService);
    await databaseService.initializeDatabase();

    // Initialize API with controllers
    const auth = Container.get(AuthController);

    // Create express app
    app = express();
    app.use(cors());
    app.use(json({ limit: '5mb' }));
    app.use(urlencoded({ extended: false }));
    app.use(morgan('dev'));
    app.use('/auth', auth.getRouter());
  });

  afterAll(async () => {
    // Close DB connection after all tests
    await databaseService.closeDatabase();
  });

  describe('POST /auth/register', () => {
    it('should register a user and return 201 status', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ message: 'User registered successfully' });
    });

    it('should return 400 if input is invalid', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ username: '', email: '', password: '' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('UserInputValidationError');
    });
  });

  describe('POST /auth/login', () => {
    it('should authenticate user and return a token', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 400 if username is invalid', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: '', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('InvalidUsernameError');
    });

    it('should return 404 if user not found', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'unknownuser', password: 'password123' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('UserNotFoundError');
    });

    it('should return 401 if password is invalid', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('InvalidPasswordError');
    });
  });
});