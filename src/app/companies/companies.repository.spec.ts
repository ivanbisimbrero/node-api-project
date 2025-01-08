import 'reflect-metadata';
import { Container } from 'typedi';
import { DatabaseService } from '../../database/database.service';
import { CompanyRepository } from './companies.repository';
import { Company } from './companies.model';
import { DBQueryResult } from '../../database/models/db-query-result';

// Repository Test
describe('CompanyRepository', () => {
  let repository: CompanyRepository;
  let databaseServiceMock: jest.Mocked<DatabaseService>;

  beforeEach(() => {
    jest.clearAllMocks();
    Container.reset();

    databaseServiceMock = {
      execQuery: jest.fn()
    } as unknown as jest.Mocked<DatabaseService>;

    Container.set(DatabaseService, databaseServiceMock);
    repository = Container.get(CompanyRepository);
  });

  describe('create', () => {
    it('should create a company and return it', async () => {
      const company: Company = { company_typeId: '1', name: 'Tech Corp', address: '123 Main St', phone: '123456789', cif: 'A12345678', active: true, admin: false };
      const mockResult: DBQueryResult = { rows: [{ id: 1, ...company }], rowCount: 1 };

      databaseServiceMock.execQuery.mockResolvedValueOnce(mockResult);

      const result = await repository.create(company);

      expect(databaseServiceMock.execQuery).toHaveBeenCalledWith({
        sql: 'INSERT INTO companies (company_typeId, name, address, phone, cif, active, admin) VALUES (?, ?, ?, ?, ?, ?, ?)',
        params: ['1', 'Tech Corp', '123 Main St', '123456789', 'A12345678', true, false]
      });
      expect(result).toEqual({ id: 1, ...company });
    });
  });

  describe('findById', () => {
    it('should return a company if found', async () => {
      const mockCompany = { id: '1', company_typeId: '1', name: 'Tech Corp', address: '123 Main St', phone: '123456789', cif: 'A12345678', active: true, admin: false };
      const mockResult: DBQueryResult = { rows: [mockCompany], rowCount: 1 };

      databaseServiceMock.execQuery.mockResolvedValueOnce(mockResult);

      const result = await repository.findById('1');

      expect(databaseServiceMock.execQuery).toHaveBeenCalledWith({
        sql: 'SELECT * FROM companies WHERE id = ?',
        params: ['1']
      });
      expect(result).toEqual(mockCompany);
    });

    it('should return null if company not found', async () => {
      const mockResult: DBQueryResult = { rows: [], rowCount: 0 };

      databaseServiceMock.execQuery.mockResolvedValueOnce(mockResult);

      const result = await repository.findById('99');

      expect(databaseServiceMock.execQuery).toHaveBeenCalledWith({
        sql: 'SELECT * FROM companies WHERE id = ?',
        params: ['99']
      });
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const mockResult: DBQueryResult = { rows: [
        { id: '1', name: 'Tech Corp', active: true },
        { id: '2', name: 'Finance Corp', active: false }
      ], rowCount: 2 };

      databaseServiceMock.execQuery.mockResolvedValueOnce(mockResult);

      const result = await repository.findAll();

      expect(databaseServiceMock.execQuery).toHaveBeenCalledWith({
        sql: 'SELECT * FROM companies'
      });
      expect(result).toEqual(mockResult.rows);
    });

    it('should return an empty array if no companies are found', async () => {
      const mockResult: DBQueryResult = { rows: [], rowCount: 0 };

      databaseServiceMock.execQuery.mockResolvedValueOnce(mockResult);

      const result = await repository.findAll();

      expect(databaseServiceMock.execQuery).toHaveBeenCalledWith({
        sql: 'SELECT * FROM companies'
      });
      expect(result).toEqual([]);
    });
  });
});