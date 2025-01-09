import 'reflect-metadata';
import { Container } from 'typedi';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersRepository } from '../users/users.repository';
import { AuthRepository } from './auth.repository';
import { User } from '../users/users.model';
import { AuthorizerUser } from './auth.model';
import { AuditService } from '../audit/audit.service';

// Service Test
describe('AuthService', () => {
  let service: AuthService;
  let usersRepositoryMock: jest.Mocked<UsersRepository>;
  let authRepositoryMock: jest.Mocked<AuthRepository>;
  let bcryptCompareMock: jest.SpyInstance;
  let bcryptHashMock: jest.SpyInstance;
  let auditServiceMock: jest.Mocked<AuditService>;

  beforeEach(() => {
    jest.clearAllMocks();
    Container.reset();

    usersRepositoryMock = {
      create: jest.fn(),
      findByUsername: jest.fn()
    } as unknown as jest.Mocked<UsersRepository>;

    authRepositoryMock = {
      createToken: jest.fn()
    } as unknown as jest.Mocked<AuthRepository>;

    auditServiceMock = {
      create: jest.fn()
    } as unknown as jest.Mocked<AuditService>;

    Container.set(AuditService, auditServiceMock);
    Container.set(UsersRepository, usersRepositoryMock);
    Container.set(AuthRepository, authRepositoryMock);
    service = Container.get(AuthService);

    bcryptCompareMock = jest.spyOn(bcrypt, 'compare');
    bcryptHashMock = jest.spyOn(bcrypt, 'hash');
  });

  describe('createUser', () => {
    it('should create a user with hashed password and create an audit log', async () => {
      const hashedPassword = 'hashedPassword123';
      const userData: Omit<User, 'id'> = {
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword
      };

      bcryptHashMock.mockResolvedValueOnce(hashedPassword);
      usersRepositoryMock.create.mockResolvedValueOnce({ id: 1, ...userData });

      const result = await service.createUser(userData);

      expect(bcryptHashMock).toHaveBeenCalledWith(hashedPassword, 10);
      expect(usersRepositoryMock.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword
      });
      expect(result).toBe(true);
      expect(auditServiceMock.create).toHaveBeenCalledWith('Created new User');
    });

    it('should throw UserInputValidationError for invalid input', async () => {
      await expect(service.createUser({ username: '', email: '', password: '' })).rejects.toThrow('UserInputValidationError');
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user and return token and create an audit log', async () => {
      const userData = { username: 'testuser', password: 'password123' };
      const user: User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };
      const token = 'mocked.jwt.token';

      usersRepositoryMock.findByUsername.mockResolvedValueOnce(user);
      bcryptCompareMock.mockResolvedValueOnce(true);
      authRepositoryMock.createToken.mockReturnValueOnce(token);

      const result = await service.authenticateUser(userData);

      expect(usersRepositoryMock.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcryptCompareMock).toHaveBeenCalledWith('password123', 'hashedPassword123');
      expect(authRepositoryMock.createToken).toHaveBeenCalledWith({ id: 1, username: 'testuser' });
      expect(result).toBe(token);
      expect(auditServiceMock.create).toHaveBeenCalledWith(`User ${user.username} authenticated`);
    });

    it('should throw InvalidUsernameError for invalid username', async () => {
      await expect(service.authenticateUser({ username: '', password: 'password123' })).rejects.toThrow('InvalidUsernameError');
    });

    it('should throw UserNotFoundError if user does not exist', async () => {
      usersRepositoryMock.findByUsername.mockResolvedValueOnce(null);
      await expect(service.authenticateUser({ username: 'testusernotfound', password: 'password123' })).rejects.toThrow('InvalidUsernameOrPasswordError');
    });

    it('should throw InvalidPasswordError for incorrect password', async () => {
      const user: User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword123'
      };
      usersRepositoryMock.findByUsername.mockResolvedValueOnce(user);
      bcryptCompareMock.mockResolvedValueOnce(false);

      await expect(service.authenticateUser({ username: 'testuser', password: 'wrongpassword' })).rejects.toThrow('InvalidUsernameOrPasswordError');
    });
  });
});
