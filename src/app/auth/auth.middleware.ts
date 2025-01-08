import { Response, NextFunction } from 'express';
import { AuthUserRequest } from './auth-user.request';
import Container from 'typedi';
import { AuthRepository } from './auth.repository';

export function authMiddleware(req: AuthUserRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    const authRepository = Container.get(AuthRepository);

    if (authHeader === undefined) {
        res.status(401).json({ error: 'Authorization header is required' });
        return;
    } else if (authHeader.toString().length === 0) {
        res.status(401).json({ error: 'Token is required' });
        return;
    }

    try {
        const decoded = authRepository.getUserFromToken(authHeader);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}