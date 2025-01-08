import 'reflect-metadata';
import request from 'supertest';
import express, { Router } from 'express';
import { Container } from 'typedi';

// Import classes
import { DatabaseService } from '../../database/database.service';
import { config } from '../../config/environment';
import { Api } from '../../server/api/api';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import morgan from 'morgan';
import { AuthRepository } from '../auth/auth.repository';

describe('CompanyTypeController Integration Test', () => {
  let app: express.Express;
  let databaseService: DatabaseService;
  let authRepository: AuthRepository;
  let token: string;
  let fakeToken: string;

  beforeEach(async () => {
    // Set database to in-memory for testing
    config.dbOptions.database = ':memory:';

    // Clear and reset container
    Container.reset();

    // Register services
    databaseService = Container.get(DatabaseService);
    await databaseService.initializeDatabase();
    authRepository = Container.get(AuthRepository);

    token = await authRepository.createToken({ id: 1, username: 'testuser' });
    fakeToken = 'fakeToken';

    // Initialize API with controllers
    const api = Container.get(Api);

    // Create express app
    app = express();
    app.use(cors());
    app.use(json({ limit: '5mb' }));
    app.use(urlencoded({ extended: false }));
    app.use(morgan('dev'));
    app.use('/api', api.getApiRouter());
  });

  afterAll(async () => {
    // Close DB connection after all tests
    await databaseService.closeDatabase();
  });

  describe('POST /api/company-types', () => {
    it('should create a company type and return it', async () => {
      const res = await request(app)
        .post('/api/company-types')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'Tech' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ message: 'CompanyType created' });
    });

    it('should return 400 if input is invalid', async () => {
      const res = await request(app)
        .post('/api/company-types')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/company-types', () => {
    it('should return all company types', async () => {
      const res = await request(app)
        .get('/api/company-types')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.any(Array));
    });
  });

  describe('GET /api/company-types/:id', () => {
    it('should return a company type by id', async () => {
      const res = await request(app)
        .get('/api/company-types/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, type: expect.any(String) });
    });

    it('should return 404 if company type not found', async () => {
      const res = await request(app)
        .get('/api/company-types/99')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 400 if id is invalid', async () => {
      const res = await request(app)
        .get('/api/company-types/invalid')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });
});