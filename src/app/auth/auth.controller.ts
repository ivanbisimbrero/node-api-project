import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { AuthService } from './auth.service';

@Service()
export class AuthController {
    private authRouter = Router();

    constructor(
        private readonly authService: AuthService
    ) {
        this.authRouter.post('/register', this.register.bind(this));
        this.authRouter.post('/login', this.login.bind(this));
    }

    getRouter(): Router {
        return this.authRouter;
    }

    async register(req: Request, res: Response): Promise<void> {
        const { username, email, password } = req.body;
        try {
            const newUser = await this.authService.createUser({ username, email, password });
            res.status(201).json({ message:"User registered successfully" });
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            }
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;
        try {
            const token = await this.authService.authenticateUser({ username, password });
            res.status(200).json({ token });
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'InvalidUsernameError') {
                    res.status(400).json({ error: error.message });
                } else if (error.message === 'InvalidUsernameOrPasswordError') {
                    res.status(403).json({ error: error.message });
                } else {
                    res.status(500).json({ error: error.message });
                }
            }
        }
    }
}