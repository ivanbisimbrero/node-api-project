import 'reflect-metadata';
import { Container } from 'typedi';
import { CompanyTypeService } from './company_types.service';
import { CompanyTypeRepository } from './company_types.repository';
import { CompanyType } from './company_types.model';
import { AuditService } from '../audit/audit.service';

// Service Test
describe('CompanyTypeService', () => {
  let service: CompanyTypeService;
  let repositoryMock: jest.Mocked<CompanyTypeRepository>;
  let auditServiceMock: jest.Mocked<AuditService>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    Container.reset();

    repositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn()
    } as unknown as jest.Mocked<CompanyTypeRepository>;

    auditServiceMock = {
      create: jest.fn(),
    } as unknown as jest.Mocked<AuditService>;

    Container.set(AuditService, auditServiceMock);

    Container.set(CompanyTypeRepository, repositoryMock);
    service = Container.get(CompanyTypeService);
  });

  describe('create', () => {
    it('should create a company type if input is valid and create an audit log', async () => {
      const companyType = 'Tech';
      const createdCompany: CompanyType = { id: '1', type: companyType };

      repositoryMock.create.mockResolvedValueOnce(createdCompany);

      const result = await service.create(companyType);

      expect(repositoryMock.create).toHaveBeenCalledWith({ type: companyType });
      expect(result).toEqual(createdCompany);
      expect(auditServiceMock.create).toHaveBeenCalledWith('Created new CompanyType');
    });

    it('should reject if input is invalid', async () => {
        await expect(service.create(null as unknown as string))
        .rejects
        .toThrow('CompanyTypeInputValidationError');

      await expect(service.create(''))
        .rejects
        .toThrow('CompanyTypeInputValidationError');
    });
  });

  describe('findAll', () => {
    it('should return all company types and create an audit log', async () => {
      const companyTypes: CompanyType[] = [
        { id: '1', type: 'Tech' },
        { id: '2', type: 'Finance' }
      ];

      repositoryMock.findAll.mockResolvedValueOnce(companyTypes);

      const result = await service.findAll();

      expect(repositoryMock.findAll).toHaveBeenCalled();
      expect(result).toEqual(companyTypes);
      expect(auditServiceMock.create).toHaveBeenCalledWith('Get all CompanyTypes');
    });

    it('should return an empty array if no company types are found and create an audit log', async () => {
      repositoryMock.findAll.mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(repositoryMock.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
      expect(auditServiceMock.create).toHaveBeenCalledWith('Get all CompanyTypes');
    });
  });

  describe('findById', () => {
    it('should return the company type if valid id and type found and create an audit log', async () => {
      const companyType: CompanyType = { id: '1', type: 'Tech' };
      repositoryMock.findById.mockResolvedValueOnce(companyType);

      const result = await service.findById('1');

      expect(repositoryMock.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(companyType);
      expect(auditServiceMock.create).toHaveBeenCalledWith('Get CompanyType with ID: 1');
    });

    it('should return null if valid id but type not found and create an audit log', async () => {
      repositoryMock.findById.mockResolvedValueOnce(null);

      const result = await service.findById('99');

      expect(repositoryMock.findById).toHaveBeenCalledWith('99');
      expect(result).toBeNull();
      expect(auditServiceMock.create).toHaveBeenCalledWith('Get CompanyType with ID: 99');
    });

    it('should reject if invalid id is provided', async () => {
        await expect(service.findById('0'))
          .rejects
          .toThrow('InvalidCompanyTypeIdError');
  
        await expect(service.findById('-1'))
          .rejects
          .toThrow('InvalidCompanyTypeIdError');
  
        await expect(service.findById(null as unknown as string))
          .rejects
          .toThrow('InvalidCompanyTypeIdError');
  
        await expect(service.findById(NaN as unknown as string))
          .rejects
          .toThrow('InvalidCompanyTypeIdError');
    });
  });
});
