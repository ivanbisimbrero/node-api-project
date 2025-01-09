import { Response, NextFunction } from 'express';
import { AuthUserRequest } from './auth-user.request';
import Container from 'typedi';
import { AuthRepository } from './auth.repository';

export function authMiddleware(req: AuthUserRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    const authRepository = Container.get(AuthRepository);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authorization header must contain a Bearer token' });
        return;
    }

    const token = authHeader.split(' ')[1]; // Extraer solo el token

    if (!token) {
        res.status(401).json({ error: 'Token is required' });
        return;
    }

    try {
        const decoded = authRepository.getUserFromToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}