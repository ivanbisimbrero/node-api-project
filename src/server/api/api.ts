import { Router } from 'express';
import { Service } from 'typedi';
import {CalculatorController} from "../../app/calculator/calculator.controller";
import { CompanyTypeController } from '../../app/company_types/company_types.controller';
import { CompanyController } from '../../app/companies/companies.controller';
import { AuthController } from '../../app/auth/auth.controller';

@Service()
export class Api {
  private apiRouter: Router;

  constructor(
    private calculatorController: CalculatorController,
    private companyTypeController: CompanyTypeController,
    private companyController: CompanyController,
    private authController: AuthController
  ) {
    this.apiRouter = Router();
    this.apiRouter.use('/calculator', calculatorController.getRouter());
    this.apiRouter.use('/company-types', companyTypeController.getRouter());
    this.apiRouter.use('/companies', companyController.getRouter());
    this.apiRouter.use('/', authController.getRouter());
  }

  getApiRouter(): Router {
    return this.apiRouter;
  }

}
