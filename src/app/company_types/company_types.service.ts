import 'reflect-metadata';

import { Service } from 'typedi';
import { isNumber, isString, toNumber } from 'lodash';

import { CompanyTypeRepository } from './company_types.repository';
import { CompanyType } from './company_types.model';

@Service()
export class CompanyTypeService {

  constructor(private readonly companyTypeRepository: CompanyTypeRepository) { }

  async create(typeName: string): Promise<CompanyType> {
    const companyType: CompanyType = { type: typeName };

    if (!this.isValidCompanyType(companyType)) {
      return Promise.reject(new Error('CompanyTypeInputValidationError'));
    }

    return await this.companyTypeRepository.create(companyType);
  }

  async findAll(): Promise<CompanyType[]> {
    return await this.companyTypeRepository.findAll();
  }

  async findById(companyTypeId: string): Promise<CompanyType | null> {
    if (!this.isValidId(companyTypeId)) {
      return Promise.reject(new Error('InvalidCompanyTypeIdError'));
    }

    return await this.companyTypeRepository.findById(companyTypeId);
  }

  private isValidId(companyTypeId: any): boolean {
    return companyTypeId != null && isNumber(toNumber(companyTypeId)) && toNumber(companyTypeId) > 0;
  }

  private isValidCompanyType(companyType: CompanyType): boolean {
    return companyType != null
      && companyType.type != null && isString(companyType.type) && companyType.type.length > 0;
  }

}