import { Service } from 'typedi';
import jwt from 'jsonwebtoken';
import { AuthorizerUser } from './auth.model';
import { isNil } from 'lodash';
import { config } from '../../config/environment';

@Service()
export class AuthRepository {

    createToken(payload: object): string {
        return jwt.sign(payload, config.user_sessions.secret, { expiresIn: config.user_sessions.expiration_days });
    }

    verifyToken(token: string): object | string {
        return jwt.verify(token, config.user_sessions.secret);
    }

    getUserFromToken(token: string): AuthorizerUser {
        const decoded = jwt.verify(token, config.user_sessions.secret) as AuthorizerUser;
        if (isNil(decoded)) {
            throw new Error('Token is not valid');
        }
        return {
            id: decoded.id,
            username: decoded.username
        };
    }
}