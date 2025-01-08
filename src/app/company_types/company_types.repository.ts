import { Service } from 'typedi';
import { CompanyType } from './company_types.model';
import { DatabaseService } from '../../database/database.service';

@Service()
export class CompanyTypeRepository {

  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async create(companyType: CompanyType): Promise<CompanyType> {
    const queryDoc = {
      sql: 'INSERT INTO company_types (type) VALUES (?)',
      params: [ companyType.type ]
    };

    const companyTypeCreated = await this.databaseService.execQuery(queryDoc);
    console.log(companyTypeCreated);
    return companyTypeCreated.rows[0];
  }

  async findAll(): Promise<CompanyType[]> {
    const queryDoc: any = {
      sql: 'SELECT * FROM company_types'
    };

    const companyTypes = await this.databaseService.execQuery(queryDoc);
    return companyTypes.rows;
  }

  async findById(companyTypeId: string): Promise<CompanyType | null> {
    const queryDoc = {
      sql: 'SELECT * FROM company_types WHERE id = ?',
      params: [companyTypeId]
    };

    const companyTypes = await this.databaseService.execQuery(queryDoc);
    return companyTypes.rows[0] || null;
  }

}