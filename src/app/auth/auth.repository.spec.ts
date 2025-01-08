import 'reflect-metadata';
import { Container } from 'typedi';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { config } from '../../config/environment';
import { AuthorizerUser } from './auth.model';

// Repository Test
describe('AuthRepository', () => {
  let repository: AuthRepository;
  let jwtSignMock: jest.SpyInstance;
  let jwtVerifyMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    Container.reset();

    repository = Container.get(AuthRepository);

    // Mock JWT methods
    jwtSignMock = jest.spyOn(jwt, 'sign');
    jwtVerifyMock = jest.spyOn(jwt, 'verify');
  });

  describe('createToken', () => {
    it('should create a valid token', () => {
      const payload: AuthorizerUser = { id: '123', username: 'testuser' };
      const mockToken = 'mocked.jwt.token';

      jwtSignMock.mockReturnValueOnce(mockToken);

      const result = repository.createToken(payload);

      expect(jwtSignMock).toHaveBeenCalledWith(
        payload,
        config.user_sessions.secret,
        { expiresIn: config.user_sessions.expiration_days }
      );
      expect(result).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', () => {
      const payload: AuthorizerUser = { id: '123', username: 'testuser' };
      const token = 'valid.jwt.token';

      jwtVerifyMock.mockReturnValueOnce(payload);

      const result = repository.verifyToken(token);

      expect(jwtVerifyMock).toHaveBeenCalledWith(
        token,
        config.user_sessions.secret
      );
      expect(result).toEqual(payload);
    });

    it('should throw an error if token is invalid', () => {
      const invalidToken = 'invalid.jwt.token';

      jwtVerifyMock.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      expect(() => repository.verifyToken(invalidToken)).toThrow('Invalid token');
      expect(jwtVerifyMock).toHaveBeenCalledWith(
        invalidToken,
        config.user_sessions.secret
      );
    });
  });

  describe('getUserFromToken', () => {
    it('should return user data if token is valid', () => {
      const mockUser: AuthorizerUser = { id: '123', username: 'testuser' };
      const token = 'valid.jwt.token';

      jwtVerifyMock.mockReturnValueOnce(mockUser);

      const result = repository.getUserFromToken(token);

      expect(jwtVerifyMock).toHaveBeenCalledWith(
        token,
        config.user_sessions.secret
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if token is invalid', () => {
      const invalidToken = 'invalid.jwt.token';

      jwtVerifyMock.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      expect(() => repository.getUserFromToken(invalidToken)).toThrow('Invalid token');
      expect(jwtVerifyMock).toHaveBeenCalledWith(
        invalidToken,
        config.user_sessions.secret
      );
    });
  });
});
