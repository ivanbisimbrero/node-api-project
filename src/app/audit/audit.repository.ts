import { Service } from 'typedi';
import { Audit } from './audit.model';
import {DatabaseService} from "../../database/database.service";

@Service()
export class AuditRepository {

  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async create(audit: Audit): Promise<Audit> {
    const queryDoc = {
      sql: 'INSERT INTO audits (message) VALUES (?)',
      params: [ audit.message ]
    };

    const auditCreated = await this.databaseService.execQuery(queryDoc);
    return auditCreated.rows[0];
  }


  async findAll(): Promise<Audit[]> {
    const queryDoc: any = {
      sql: 'SELECT * FROM audits'
    };

    const audits = await this.databaseService.execQuery(queryDoc);
    return audits.rows;
  }

  async findById(auditId: number): Promise<Audit | null> {
    const queryDoc = {
      sql: 'SELECT * FROM audits WHERE id = ?',
      params: [auditId]
    };

    const audits = await this.databaseService.execQuery(queryDoc);
    return audits.rows[0] || null;
  }

}
