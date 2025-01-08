import 'reflect-metadata';
import { Container } from 'typedi';
import { CompanyService } from './companies.service';
import { CompanyRepository } from './companies.repository';
import { Company } from './companies.model';

// Service Test
describe('CompanyService', () => {
  let service: CompanyService;
  let repositoryMock: jest.Mocked<CompanyRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    Container.reset();

    repositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn()
    } as unknown as jest.Mocked<CompanyRepository>;

    Container.set(CompanyRepository, repositoryMock);
    service = Container.get(CompanyService);
  });

  describe('create', () => {
    it('should create a company if input is valid', async () => {
      const companyData = {
        company_typeId: '1',
        name: 'Tech Corp',
        address: '123 Main St',
        phone: '123456789',
        cif: 'A12345678',
        active: true,
        admin: false
      };
      const createdCompany: Company = { id: '1', ...companyData };

      repositoryMock.create.mockResolvedValueOnce(createdCompany);

      const result = await service.create(companyData);

      expect(repositoryMock.create).toHaveBeenCalledWith(companyData);
      expect(result).toEqual(createdCompany);
    });

    it('should reject if input is invalid', async () => {
      await expect(service.create({} as Company))
        .rejects
        .toThrow('CompanyInputValidationError');
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const companies: Company[] = [
        { id: '1', name: 'Tech Corp', active: true } as Company,
        { id: '2', name: 'Finance Corp', active: false } as Company
      ];

      repositoryMock.findAll.mockResolvedValueOnce(companies);

      const result = await service.findAll();

      expect(repositoryMock.findAll).toHaveBeenCalled();
      expect(result).toEqual(companies);
    });

    it('should return an empty array if no companies are found', async () => {
      repositoryMock.findAll.mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(repositoryMock.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return a company if valid id and company found', async () => {
      const company: Company = {
        company_typeId: '1',
        name: 'Tech Corp',
        address: '123 Main St',
        phone: '123456789',
        cif: 'A12345678',
        active: true,
        admin: false
      };
      repositoryMock.findById.mockResolvedValueOnce(company);

      const result = await service.findById('1');

      expect(repositoryMock.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(company);
    });

    it('should return null if valid id but company not found', async () => {
      repositoryMock.findById.mockResolvedValueOnce(null);

      const result = await service.findById('99');

      expect(repositoryMock.findById).toHaveBeenCalledWith('99');
      expect(result).toBeNull();
    });

    it('should reject if invalid id is provided', async () => {
      await expect(service.findById('0'))
        .rejects
        .toThrow('InvalidCompanyIdError');

      await expect(service.findById('invalid'))
        .rejects
        .toThrow('InvalidCompanyIdError');
    });
  });
});
