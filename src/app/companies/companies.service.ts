import 'reflect-metadata';

import { Service } from 'typedi';
import { isString, isNumber, toNumber } from 'lodash';

import { CompanyRepository } from './companies.repository';
import { Company } from './companies.model';

@Service()
export class CompanyService {

  constructor(private readonly companyRepository: CompanyRepository) { }

  async create(companyData: Omit<Company, 'id'>): Promise<Company> { //Preguntar a Raul que es Omit, por el apaño del chat
    if (!this.isValidCompany(companyData)) {
      return Promise.reject(new Error('CompanyInputValidationError'));
    }

    return await this.companyRepository.create(companyData);
  }

  async findAll(): Promise<Company[]> {
    return await this.companyRepository.findAll();
  }

  async findById(companyId: string): Promise<Company | null> {
    if (!this.isValidId(companyId)) {
      return Promise.reject(new Error('InvalidCompanyIdError'));
    }

    return await this.companyRepository.findById(companyId);
  }

  private isValidId(companyId: any): boolean {
    return companyId != null && isNumber(toNumber(companyId)) && toNumber(companyId) > 0;
  }

  private isValidCompany(company: Company): boolean {
    return company != null
      && company.company_typeId != null && isNumber(toNumber(company.company_typeId))
      && company.name != null && isString(company.name)
  }

}