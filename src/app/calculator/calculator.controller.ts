import { Service } from 'typedi';
import { CalculatorService } from './calculator.service';
import {Request, Response, Router} from 'express';

@Service()
export class CalculatorController {
  private calculatorRouter = Router();

  constructor(
    private readonly calculatorService: CalculatorService
  ) {
    this.calculatorRouter.get('/', this.calculator.bind(this));
  }

  getRouter(): Router {
    return this.calculatorRouter;
  }

  async calculator(req:Request, res: Response): Promise<void> {
    const queryParams = req.query;
    const operation = queryParams['operation'] as string;
    const operator1 = parseInt(queryParams['operator1'] as string, 10); // Convert to integer (base 10)
    const operator2 = parseInt(queryParams['operator2'] as string, 10); // Convert to integer (base 10)
    let result:number = 0;
    try {
      switch (operation) {
        case 'add':
            result = this.calculatorService.add(operator1, operator2);
            break;
        case 'minus':
            result = this.calculatorService.minus(operator1, operator2);
            break;
        case 'multiply':
            result = this.calculatorService.multiply(operator1, operator2);
            break;
        case 'divide':
            result = this.calculatorService.divide(operator1, operator2);
            break;
        default:
            res.sendStatus(400);
            return;
      }
      res.json({resultado: result});
    } catch(e) {
      res.sendStatus(400);
    }
  }

}
