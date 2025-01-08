import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { Service } from 'typedi';
import path from 'path';
import { config } from '../config/environment';

@Service()
export class DatabaseTestService {
  private db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

  public async openDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
    if (this.db) {
      return this.db;
    }

    this.db = await open({
      filename: path.join(__dirname, `../data/${config.dbOptions.database}`),
      driver: sqlite3.Database
    });

    return this.db;
  }

  public async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  public async dumpDatabase(): Promise<any> {
    await this.openDatabase();

    this.db!.exec(`
      DROP TABLE IF EXISTS company_types;
      `);

    this.db!.exec(`
      DROP TABLE IF EXISTS users;
      `);
    this.db!.exec(`
      DROP TABLE IF EXISTS companies;
      `);
    this.db!.exec(`
      DROP TABLE IF EXISTS audits;
      `);

    await this.closeDatabase();
  }
}