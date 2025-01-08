import 'reflect-metadata';
import { Container } from 'typedi';
import { DatabaseService } from '../../database/database.service';
import { CompanyTypeRepository } from './company_types.repository';
import { CompanyType } from './company_types.model';
import { DBQueryResult } from '../../database/models/db-query-result';

// Repository Test
describe('CompanyTypeRepository', () => {
  let repository: CompanyTypeRepository;
  let databaseServiceMock: jest.Mocked<DatabaseService>;

  beforeEach(() => {
    jest.clearAllMocks();
    Container.reset();

    databaseServiceMock = {
      execQuery: jest.fn()
    } as unknown as jest.Mocked<DatabaseService>;

    Container.set(DatabaseService, databaseServiceMock);
    repository = Container.get(CompanyTypeRepository);
  });

  describe('create', () => {
    it('should create a company type and return it', async () => {
      const companyType: CompanyType = { type: 'Tech' };
      const mockResult: DBQueryResult = { rows: [{ id: 1, type: 'Tech' }], rowCount: 1 };

      databaseServiceMock.execQuery.mockResolvedValueOnce(mockResult);

      const result = await repository.create(companyType);

      expect(databaseServiceMock.execQuery).toHaveBeenCalledWith({
        sql: 'INSERT INTO company_types (type) VALUES (?)',
        params: ['Tech']
      });
      expect(result).toEqual({ id: 1, type: 'Tech' });
    });
  });

  describe('findById', () => {
    it('should return the company type if found', async () => {
      const mockResult: DBQueryResult = { rows: [{ id: 1, type: 'Tech' }], rowCount: 1 };

      databaseServiceMock.execQuery.mockResolvedValueOnce(mockResult);

      const result = await repository.findById('1');

      expect(databaseServiceMock.execQuery).toHaveBeenCalledWith({
        sql: 'SELECT * FROM company_types WHERE id = ?',
        params: ['1']
      });
      expect(result).toEqual({ id: 1, type: 'Tech' });
    });

    it('should return null if company type not found', async () => {
      const mockResult: DBQueryResult = { rows: [], rowCount: 0 };

      databaseServiceMock.execQuery.mockResolvedValueOnce(mockResult);

      const result = await repository.findById('99');

      expect(databaseServiceMock.execQuery).toHaveBeenCalledWith({
        sql: 'SELECT * FROM company_types WHERE id = ?',
        params: ['99']
      });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all company types', async () => {
      const mockResult: DBQueryResult = { rows: [
        { id: 1, type: 'Tech' },
        { id: 2, type: 'Finance' }
      ], rowCount: 2 };

      databaseServiceMock.execQuery.mockResolvedValueOnce(mockResult);

      const result = await repository.findAll();

      expect(databaseServiceMock.execQuery).toHaveBeenCalledWith({
        sql: 'SELECT * FROM company_types'
      });
      expect(result).toEqual([
        { id: 1, type: 'Tech' },
        { id: 2, type: 'Finance' }
      ]);
    });

    it('should return an empty array if no company types found', async () => {
      const mockResult: DBQueryResult = { rows: [], rowCount: 0 };

      databaseServiceMock.execQuery.mockResolvedValueOnce(mockResult);

      const result = await repository.findAll();

      expect(databaseServiceMock.execQuery).toHaveBeenCalledWith({
        sql: 'SELECT * FROM company_types'
      });
      expect(result).toEqual([]);
    });
  });
});