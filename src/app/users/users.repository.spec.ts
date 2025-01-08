import 'reflect-metadata';
import { Container } from 'typedi';
import { DatabaseService } from '../../database/database.service';
import { UsersRepository } from './users.repository';
import { User } from './users.model';
import { DBQueryResult } from '../../database/models/db-query-result';

// Repository Test
describe('UsersRepository', () => {
  let repository: UsersRepository;
  let databaseServiceMock: jest.Mocked<DatabaseService>;

  beforeEach(() => {
    jest.clearAllMocks();
    Container.reset();

    databaseServiceMock = {
      execQuery: jest.fn()
    } as unknown as jest.Mocked<DatabaseService>;

    Container.set(DatabaseService, databaseServiceMock);
    repository = Container.get(UsersRepository);
  });

  describe('create', () => {
    it('should create a user and return it', async () => {
      const user: User = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      const mockResult: DBQueryResult = {
        rows: [{ id: 1, ...user }],
        rowCount: 1
      };

      databaseServiceMock.execQuery.mockResolvedValueOnce(mockResult);

      const result = await repository.create(user);

      expect(databaseServiceMock.execQuery).toHaveBeenCalledWith({
        sql: 'INSERT INTO users (username, email, password) VALUES (?,?,?)',
        params: ['testuser', 'test@example.com', 'password123']
      });
      expect(result).toEqual({ id: 1, ...user });
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com', password: 'password123' };
      const mockResult: DBQueryResult = { rows: [mockUser], rowCount: 1 };

      databaseServiceMock.execQuery.mockResolvedValueOnce(mockResult);

      const result = await repository.findById('1');

      expect(databaseServiceMock.execQuery).toHaveBeenCalledWith({
        sql: 'SELECT * FROM users WHERE id = ?',
        params: ['1']
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const mockResult: DBQueryResult = { rows: [], rowCount: 0 };

      databaseServiceMock.execQuery.mockResolvedValueOnce(mockResult);

      const result = await repository.findById('99');

      expect(databaseServiceMock.execQuery).toHaveBeenCalledWith({
        sql: 'SELECT * FROM users WHERE id = ?',
        params: ['99']
      });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockResult: DBQueryResult = { rows: [
        { id: 1, username: 'testuser1', email: 'test1@example.com' },
        { id: 2, username: 'testuser2', email: 'test2@example.com' }
      ], rowCount: 2 };

      databaseServiceMock.execQuery.mockResolvedValueOnce(mockResult);

      const result = await repository.findAll();

      expect(databaseServiceMock.execQuery).toHaveBeenCalledWith({
        sql: 'SELECT * FROM users'
      });
      expect(result).toEqual(mockResult.rows);
    });

    it('should return an empty array if no users are found', async () => {
      const mockResult: DBQueryResult = { rows: [], rowCount: 0 };

      databaseServiceMock.execQuery.mockResolvedValueOnce(mockResult);

      const result = await repository.findAll();

      expect(databaseServiceMock.execQuery).toHaveBeenCalledWith({
        sql: 'SELECT * FROM users'
      });
      expect(result).toEqual([]);
    });
  });
});