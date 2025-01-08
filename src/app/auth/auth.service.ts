import { Service } from 'typedi';
import bcrypt from 'bcrypt';
import { UsersRepository } from '../users/users.repository';
import { User } from '../users/users.model';
import { isString } from 'lodash';
import { AuthRepository } from './auth.repository';

@Service()
export class AuthService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly authRepository: AuthRepository
    ) {}

    async createUser(userData: Omit<User, 'id'>): Promise<boolean> {
        if (!this.isValidUser(userData)) {
            return Promise.reject(new Error('UserInputValidationError'));
        }

        const hashedPassword = await this.hashPassword(userData.password);
        const user = { ...userData, password: hashedPassword };
        const newUser = await this.usersRepository.create(user);
        return newUser != null;
    }

    async authenticateUser(userData: { username: string, password: string }): Promise<string> {
        if (!this.isValidUsername(userData.username)) {
            return Promise.reject(new Error('InvalidUsernameError'));
        }

        const user = await this.usersRepository.findByUsername(userData.username);
        if (!user) {
            return Promise.reject(new Error('UserNotFoundError'));
        }

        const isPasswordValid = await this.checkPassword(userData.password, user.password);
        if (!isPasswordValid) {
            return Promise.reject(new Error('InvalidPasswordError'));
        }

        const token = this.authRepository.createToken({ id: user.id, username: user.username });
        return token;
    }

    async checkPassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    async hashPassword(password: string): Promise<string> {
        const salt = 10;
        return await bcrypt.hash(password, salt);
    }

    isValidUsername(username: any): boolean {
        return username != null && isString(username) && username.trim().length > 0;
    }

    isValidUser(user: User): boolean {
        return user != null
            && user.username != null && isString(user.username) && user.username.trim().length > 0
            && user.email != null && isString(user.email) && user.email.trim().length > 0
            && user.password != null && isString(user.password) && user.password.trim().length > 0;
    }

}