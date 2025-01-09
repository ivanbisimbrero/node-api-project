import 'reflect-metadata';

import { Service } from 'typedi';
import { isString, isNumber, toNumber } from 'lodash';

import { CompanyRepository } from './companies.repository';
import { Company } from './companies.model';
import { AuditService } from '../audit/audit.service';

@Service()
export class CompanyService {

  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly auditService: AuditService
  ) { }

  async create(companyData: Omit<Company, 'id'>): Promise<Company> {
    if (!this.isValidCompany(companyData)) {
      return Promise.reject(new Error('CompanyInputValidationError'));
    }
    await this.auditService.create("Created new Company");
    return await this.companyRepository.create(companyData);
  }

  async findAll(): Promise<Company[]> {
    await this.auditService.create("Get all Companies");
    return await this.companyRepository.findAll();
  }

  async findById(companyId: string): Promise<Company | null> {
    if (!this.isValidId(companyId)) {
      return Promise.reject(new Error('InvalidCompanyIdError'));
    }
    await this.auditService.create(`Get Company with ID: ${companyId}`);
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