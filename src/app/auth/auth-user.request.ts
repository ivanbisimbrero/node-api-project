import { AuthorizerUser } from "./auth.model";
import type { Request } from 'express';

export interface AuthUserRequest extends Request {
    user?: AuthorizerUser;
}