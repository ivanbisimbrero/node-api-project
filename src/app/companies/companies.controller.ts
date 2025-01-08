import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { CompanyService } from './companies.service';
import { authMiddleware } from '../auth/auth.middleware';
import { Company } from './companies.model';

@Service()
export class CompanyController {
    private companyRouter = Router();

    constructor(
        private readonly companyService: CompanyService
    ) {
        this.companyRouter.post('/', this.createCompany.bind(this));
        this.companyRouter.get('/', this.getAllCompanies.bind(this));
        this.companyRouter.get('/:id', this.getCompanyById.bind(this));
        this.companyRouter.use(authMiddleware.bind(this));
    }

    getRouter(): Router {
        return this.companyRouter;
    }

    async createCompany(req: Request, res: Response): Promise<void> {
        const { company_typeId, name, address, phone, cif, active, admin } = req.body;
        try {
            const newCompany = await this.companyService.create({
            company_typeId,
            name,
            address,
            phone,
            cif,
            active,
            admin
            });
            res.status(201).json({ message: 'Company created' });
        } catch (error) {
            if(error instanceof Error) { 
                res.status(400).json({ error: error.message });
            }
        }
    }

    async getAllCompanies(req: Request, res: Response): Promise<void> {
        try {
            const companies = await this.companyService.findAll();
            res.status(200).json(companies);
        } catch (error) {
            if(error instanceof Error) { 
                res.status(400).json({ error: error.message });
            }
        }
    }

    async getCompanyById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        try {
            const company = await this.companyService.findById(id);
            if (company) {
                res.status(200).json(company);
            } else {
                res.status(404).json({ error: 'Company not found' });
            }
        } catch (error) {
            if(error instanceof Error) { 
                res.status(400).json({ error: error.message });
            }
        }
    }
}