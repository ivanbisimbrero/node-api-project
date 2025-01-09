import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { CompanyTypeService } from './company_types.service';
import { CompanyType } from './company_types.model';
import { authMiddleware } from '../auth/auth.middleware';

@Service()
export class CompanyTypeController {
    private companyTypeRouter = Router();

    constructor(
        private readonly companyTypeService: CompanyTypeService,
    ) {
        this.companyTypeRouter.use(authMiddleware.bind(this));
        this.companyTypeRouter.post('/', this.createCompanyType.bind(this));
        this.companyTypeRouter.get('/', this.getAllCompanyTypes.bind(this));
        this.companyTypeRouter.get('/:id', this.getCompanyTypeById.bind(this));
    }

    getRouter(): Router {
        return this.companyTypeRouter;
    }

    async createCompanyType(req: Request, res: Response): Promise<void> {
        const { type } = req.body;
        try {
            const newCompanyType = await this.companyTypeService.create(type) as CompanyType;
            console.log(newCompanyType);
            res.status(201).json({ message: 'CompanyType created' });
        } catch (error) {
            if(error instanceof Error) { 
                if(error.message === 'CompanyTypeInputValidationError') {
                    res.status(400).json({ error: error.message });
                } else {
                    res.status(500).json({ error: error.message });
                }
            }
        }
    }

    async getAllCompanyTypes(req: Request, res: Response): Promise<void> {
        try {
            const companyTypes = await this.companyTypeService.findAll();
            res.status(200).json(companyTypes);
        } catch (error) {
            if(error instanceof Error) { 
                res.status(400).json({ error: error.message });
            }
        }
    }

    async getCompanyTypeById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const companyType = await this.companyTypeService.findById(id);
            if (companyType) {
                res.status(200).json(companyType);
            } else {
                res.status(404).json({ error: 'CompanyType not found' });
            }
        } catch (error) {
            if(error instanceof Error) { 
                res.status(400).json({ error: error.message });
            }
        }
    }
}