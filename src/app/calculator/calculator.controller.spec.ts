import 'reflect-metadata';
import request from 'supertest';
import express, {Router} from 'express';
import { Container } from 'typedi';

// Import classes
import {DatabaseService} from "../../database/database.service";
import {config} from "../../config/environment";
import {Api} from "../../server/api/api";
import cors from "cors";
import {json, urlencoded} from "body-parser";
import morgan from "morgan";

describe('CalculatorController Integration Test', () => {
  let app: express.Express;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    // Set database to in-memory for testing
    config.dbOptions.database = ':memory:';

    // Clear and reset container
    Container.reset();

    // Register services
    // The DatabaseService uses ':memory:' DB now
    databaseService = Container.get(DatabaseService);
    await databaseService.initializeDatabase();

    // Get the controller instance, which also instantiates the CalculatorService and AuditService
    //const calculatorController = Container.get(CalculatorController);
    const api = Container.get(Api);

    // Create express app and use the controller
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

  it('should return 200 and sum when operation=add and record an audit', async () => {
    const res = await request(app)
      .get('/api/calculator')
      .query({ operation: 'add', operator1: '2', operator2: '3' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ resultado: 5 });
  });

  it('should return 200 and difference for operation=minus and record an audit', async () => {
    const res = await request(app)
      .get('/api/calculator')
      .query({ operation: 'minus', operator1: '5', operator2: '2' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ resultado: 3 });
  });

  it('should return 200 and product for operation=multiply and record an audit', async () => {
    const res = await request(app)
      .get('/api/calculator')
      .query({ operation: 'multiply', operator1: '4', operator2: '3' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ resultado: 12 });
  });

  it('should return 200 and division for operation=divide and record an audit', async () => {
    const res = await request(app)
      .get('/api/calculator')
      .query({ operation: 'divide', operator1: '10', operator2: '2' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ resultado: 5 });
  });

  it('should return 400 if invalid operation', async () => {
    const res = await request(app)
      .get('/api/calculator')
      .query({ operation: 'invalid', operator1: '2', operator2: '3' });

    expect(res.status).toBe(400);
  });

  it('should return 400 if invalid operators', async () => {
    const res = await request(app)
      .get('/api/calculator')
      .query({ operation: 'add', operator1: 'NaN', operator2: '3' });

    expect(res.status).toBe(400);
  });

  it('should return 400 if division by zero', async () => {
    const res = await request(app)
      .get('/api/calculator')
      .query({ operation: 'divide', operator1: '10', operator2: '0' });

    expect(res.status).toBe(400);
  });
});
