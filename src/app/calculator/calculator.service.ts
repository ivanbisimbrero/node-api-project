import { Service } from 'typedi';
import _ from 'lodash';
import { AuditService } from '../audit/audit.service';

@Service()
export class CalculatorService {

  constructor(private auditService: AuditService) {
  }

  private validateOperators(op1: number, op2: number): boolean {
    if (!_.isNil(op1) && !_.isNil(op2) && !_.isNaN(op1) && !_.isNaN(op2) && _.isFinite(op1) && _.isFinite(op2)) {
      return true;
    } else {
      return false;
    }
  }

  public add(op1: number, op2: number): number {
    let result:number;
    if (this.validateOperators(op1, op2)) {
      result = op1 + op2;
      this.auditService.create(`Suma de ${op1} y ${op2}`);
      return result;
    } else {
      throw new Error('NotValidOperators');
    }
  }

  public minus(op1: number, op2: number): number {
    if (this.validateOperators(op1, op2)) {
      this.auditService.create(`Resta de ${op1} y ${op2}`);
      return op1 - op2;
    } else {
      throw new Error('NotValidOperators');
    }
  }

  public multiply(op1: number, op2: number): number {
    if (this.validateOperators(op1, op2)) {
      this.auditService.create(`Multiplicación de ${op1} y ${op2}`);
      return op1 * op2;
    } else {
      throw new Error('NotValidOperators');
    }
  }

  public divide(op1: number, op2: number): number {
    if (this.validateOperators(op1, op2)) {
      if (op2 !== 0) {
        this.auditService.create(`División de ${op1} y ${op2}`);
        return op1 / op2;
      } else {
        throw new Error('DivisionByZero');
      }
    } else {
      throw new Error('NotValidOperators');
    }
  }

}
