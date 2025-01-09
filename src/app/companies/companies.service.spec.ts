import 'reflect-metadata';
import { Container } from 'typedi';
import { CompanyService } from './companies.service';
import { CompanyRepository } from './companies.repository';
import { Company } from './companies.model';
import { AuditService } from '../audit/audit.service';

// Service Test
describe('CompanyService', () => {
  let service: CompanyService;
  let repositoryMock: jest.Mocked<CompanyRepository>;
  let auditServiceMock: jest.Mocked<AuditService>;

  beforeEach(() => {
    jest.clearAllMocks();
    Container.reset();

    repositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn()
    } as unknown as jest.Mocked<CompanyRepository>;

    auditServiceMock = {
      create: jest.fn(),
    } as unknown as jest.Mocked<AuditService>;

    Container.set(AuditService, auditServiceMock);

    Container.set(CompanyRepository, repositoryMock);
    service = Container.get(CompanyService);
  });

  describe('create', () => {
    it('should create a company if input is valid and create an audit log', async () => {
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
      expect(auditServiceMock.create).toHaveBeenCalledWith('Created new Company');
    });

    it('should reject if input is invalid', async () => {
      await expect(service.create({} as Company))
        .rejects
        .toThrow('CompanyInputValidationError');
    });
  });

  describe('findAll', () => {
    it('should return all companies and create an audit log', async () => {
      const companies: Company[] = [
        {
          id: '1',
          company_typeId: '1',
          name: 'Tech Corp',
          address: '123 Main St',
          phone: '123456789',
          cif: 'A12345678',
          active: true,
          admin: false
        },
        {
          id: '2',
          company_typeId: '2',
          name: 'Finance Corp',
          address: '456 Elm St',
          phone: '987654321',
          cif: 'B87654321',
          active: false,
          admin: false
        }
      ];

      repositoryMock.findAll.mockResolvedValueOnce(companies);

      const result = await service.findAll();

      expect(repositoryMock.findAll).toHaveBeenCalled();
      expect(result).toEqual(companies);
      expect(auditServiceMock.create).toHaveBeenCalledWith('Get all Companies');
    });

    it('should return an empty array if no companies are found and create an audit log', async () => {
      repositoryMock.findAll.mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(repositoryMock.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(auditServiceMock.create).toHaveBeenCalledWith('Get all Companies');
    });
  });

  describe('findById', () => {
    it('should return a company if valid id and company found and create an audit log', async () => {
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
      expect(auditServiceMock.create).toHaveBeenCalledWith('Get Company with ID: 1');
    });

    it('should return null if valid id but company not found and create an audit log', async () => {
      repositoryMock.findById.mockResolvedValueOnce(null);

      const result = await service.findById('99');

      expect(repositoryMock.findById).toHaveBeenCalledWith('99');
      expect(result).toBeNull();
      expect(auditServiceMock.create).toHaveBeenCalledWith('Get Company with ID: 99');
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
