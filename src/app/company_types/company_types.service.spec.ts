import 'reflect-metadata';
import { Container } from 'typedi';
import { CompanyTypeService } from './company_types.service';
import { CompanyTypeRepository } from './company_types.repository';
import { CompanyType } from './company_types.model';

// Service Test
describe('CompanyTypeService', () => {
  let service: CompanyTypeService;
  let repositoryMock: jest.Mocked<CompanyTypeRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    Container.reset();

    repositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn()
    } as unknown as jest.Mocked<CompanyTypeRepository>;

    Container.set(CompanyTypeRepository, repositoryMock);
    service = Container.get(CompanyTypeService);
  });

  describe('create', () => {
    it('should create a company type if input is valid', async () => {
      const companyType = 'Tech';
      const createdCompany: CompanyType = { id: '1', type: companyType };

      repositoryMock.create.mockResolvedValueOnce(createdCompany);

      const result = await service.create(companyType);

      expect(repositoryMock.create).toHaveBeenCalledWith({ type: companyType });
      expect(result).toEqual(createdCompany);
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
    it('should return all company types', async () => {
      const companyTypes: CompanyType[] = [
        { id: '1', type: 'Tech' },
        { id: '2', type: 'Finance' }
      ];

      repositoryMock.findAll.mockResolvedValueOnce(companyTypes);

      const result = await service.findAll();

      expect(repositoryMock.findAll).toHaveBeenCalled();
      expect(result).toEqual(companyTypes);
    });

    it('should return an empty array if no company types are found', async () => {
      repositoryMock.findAll.mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(repositoryMock.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return the company type if valid id and type found', async () => {
      const companyType: CompanyType = { id: '1', type: 'Tech' };
      repositoryMock.findById.mockResolvedValueOnce(companyType);

      const result = await service.findById('1');

      expect(repositoryMock.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(companyType);
    });

    it('should return null if valid id but type not found', async () => {
      repositoryMock.findById.mockResolvedValueOnce(null);

      const result = await service.findById('99');

      expect(repositoryMock.findById).toHaveBeenCalledWith('99');
      expect(result).toBeNull();
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
