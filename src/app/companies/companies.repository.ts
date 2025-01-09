import { Service } from 'typedi';
import { Company } from './companies.model';
import { DatabaseService } from '../../database/database.service';

@Service()
export class CompanyRepository {

  constructor(
    private readonly databaseService: DatabaseService
  ) {}

  async create(company: Company): Promise<Company> {
    const queryDoc = {
      sql: 'INSERT INTO companies (company_typeId, name, address, phone, cif, active, admin) VALUES (?, ?, ?, ?, ?, ?, ?)',
      params: [ company.company_typeId, company.name, company.address, company.phone, company.cif, company.active ?? true, company.admin ?? false ]
    };

    const companyCreated = await this.databaseService.execQuery(queryDoc);
    console.log(companyCreated);
    return companyCreated.rows[0];
  }

  async findAll(): Promise<Company[]> {
    const queryDoc: any = {
      sql: 'SELECT * FROM companies'
    };

    const companies = await this.databaseService.execQuery(queryDoc);
    return companies.rows;
  }

  async findById(companyId: string): Promise<Company | null> {
    const queryDoc = {
      sql: 'SELECT * FROM companies WHERE id = ?',
      params: [companyId]
    };

    const companies = await this.databaseService.execQuery(queryDoc);
    return companies.rows[0] || null;
  }

}