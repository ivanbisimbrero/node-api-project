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
import  { AuthRepository } from '../auth/auth.repository';
import { DatabaseTestService } from '../../database/database.test.service';

describe('CompanyController Integration Test', () => {
  let app: express.Express;
  let databaseService: DatabaseService;
  let authRepository: AuthRepository;
  let databaseTestService: DatabaseTestService;
  let token: string;
  let fakeToken: string;

  beforeAll(async () => { 
    databaseTestService = Container.get(DatabaseTestService);
    await databaseTestService.dumpDatabase();
  });

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
    fakeToken = 'invalid.token';

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
    await databaseTestService.closeDatabase();
  });

  describe('POST /api/companies', () => {
    it('should create a company and return it', async () => {
      const resCompanyType = await request(app)
        .post('/api/company-types')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'Tech' });
      const res = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company_typeId: '1',
          name: 'Tech Corp',
          address: '123 Main St',
          phone: '123456789',
          cif: 'A12345678',
          active: true,
          admin: false
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ message: 'Company created' });
    });

    it('should return 401 if token is invalid', async () => {
      const res = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${fakeToken}`)
        .send({
          company_typeId: '1',
          name: 'Tech Corp',
          address: '123 Main St',
          phone: '123456789',
          cif: 'A12345678',
          active: true,
          admin: false
        });
      console.log(res);
      expect(res.status).toBe(401);
    });

    it('should return 400 if input is invalid', async () => {
      const res = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/companies', () => {
    it('should return all companies', async () => {
      const resCompanyType = await request(app)
        .post('/api/company-types')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'Tech' });
      const resCompany = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company_typeId: '1',
          name: 'Tech Corp',
          address: '123 Main St',
          phone: '123456789',
          cif: 'A12345678',
          active: true,
          admin: false
        });
      const res = await request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.any(Array));
    });

    it('should return 401 if token is invalid', async () => {
      const res = await request(app)
        .get('/api/companies')
        .set('Authorization', `Bearer ${fakeToken}`);
  
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/companies/:id', () => {
    it('should return a company by id', async () => {
      const resCompanyType = await request(app)
        .post('/api/company-types')
        .set('Authorization', `Bearer ${token}`)
        .send({ type: 'Tech' });
      const resCompany = await request(app)
        .post('/api/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company_typeId: '1',
          name: 'Tech Corp',
          address: '123 Main St',
          phone: '123456789',
          cif: 'A12345678',
          active: true,
          admin: false
        });
      const res = await request(app)
        .get('/api/companies/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, name: expect.any(String), active: expect.any(Number), company_typeId: expect.any(Number), address: expect.any(String), phone: expect.any(String), cif: expect.any(String), admin: expect.any(Number) });
    });

    it('should return 401 if token is invalid', async () => {
      const res = await request(app)
        .get('/api/companies/1')
        .set('Authorization', `Bearer ${fakeToken}`);
  
      expect(res.status).toBe(401);
    });

    it('should return 404 if company not found', async () => {
      const res = await request(app)
        .get('/api/companies/99')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 400 if id is invalid', async () => {
      const res = await request(app)
        .get('/api/companies/invalid')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
    });
  });
});
