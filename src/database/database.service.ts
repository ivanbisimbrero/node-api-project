import sqlite3 from 'sqlite3';
import {Database, open} from 'sqlite';
import { Service } from 'typedi';
import {config} from '../config/environment';

import path from "path";
import {DBQuery} from "./models/db-query";
import {DBQueryResult} from "./models/db-query-result";

@Service()
export class DatabaseService {
  private db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

  public async openDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
    if (this.db) {
      return this.db;
    }

    this.db = await open({
      filename: path.join(__dirname, `../data/${config.dbOptions.database}`),
      driver: sqlite3.Database
    });

    await this.db.exec(`PRAGMA foreign_keys = ON;`);

    return this.db;
  }

  public async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  /**
   * Esta función tiene el objetivo de ejecutar una determinada consulta SQL y
   * devolver los resultados de la ejecución.
   */
  public async execQuery(query: DBQuery): Promise<DBQueryResult> {
    const dbClient = await this.openDatabase();
    const { sql, params } = query;

    try {
      const rows: [] = await dbClient.all(sql, params);

      return { rows: rows, rowCount: rows.length };
    } finally {
      await this.closeDatabase();
    }
  }

  public async initializeDatabase(): Promise<void> {
    await this.openDatabase();

    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS company_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL
      )
    `);

    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_typeId INTEGER NOT NULL,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        cif TEXT,
        active BOOLEAN DEFAULT(FALSE),
        admin BOOLEAN DEFAULT(FALSE),
        FOREIGN KEY(company_typeId) REFERENCES company_types(id) ON DELETE RESTRICT
      )
    `);

    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS audits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL
      )
    `);

    await this.db!.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        admin BOOLEAN DEFAULT(FALSE)
      )
    `);

    await this.closeDatabase();
  }
}
