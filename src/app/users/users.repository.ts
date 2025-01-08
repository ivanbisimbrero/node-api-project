import { Service } from 'typedi';
import { DatabaseService } from '../../database/database.service';
import { User } from './users.model';


@Service()
export class UsersRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async create(user: User): Promise<User> {
    const queryDoc = {
        sql: 'INSERT INTO users (username, email, password) VALUES (?,?,?)',
        params: [ user.username, user.email, user.password ]
    };
    
    const userCreated = await this.databaseService.execQuery(queryDoc);
    return userCreated.rows[0];
  }

  async findAll(): Promise<User[]> {
    const queryDoc = {
      sql: 'SELECT * FROM users'
    };

    const users = await this.databaseService.execQuery(queryDoc);
    return users.rows;
  }

  async findById(userId: string): Promise<User | null> {
    const queryDoc = {
      sql: 'SELECT * FROM users WHERE id = ?',
      params: [ userId ]
    };

    const users = await this.databaseService.execQuery(queryDoc);
    return users.rows[0] || null;
  }

  async findByUsername(username: string): Promise<any | null> {
    const queryDoc = {
        sql: 'SELECT * FROM users WHERE username = ?',
        params: [ username ]
      };
  
      const users = await this.databaseService.execQuery(queryDoc);
      return users.rows[0] || null;
  }
}