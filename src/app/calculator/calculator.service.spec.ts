import 'reflect-metadata';
import { CalculatorService } from './calculator.service';
import { AuditService } from '../audit/audit.service';
import {Container} from "typedi";

describe('CalculatorService', () => {
  let calculatorService: CalculatorService;
  let auditServiceMock: jest.Mocked<AuditService>;

  beforeEach(() => {
    jest.clearAllMocks();
    Container.reset();

    auditServiceMock = {
      create: jest.fn(),
    } as unknown as jest.Mocked<AuditService>;

    // Registrar el mock en el contenedor antes de obtener el CalculatorService
    Container.set(AuditService, auditServiceMock);

    // Obtener la instancia de CalculatorService desde el contenedor
    calculatorService = Container.get(CalculatorService);
  });

  describe('minus', () => {
    it('should return the difference of two valid numbers', () => {
      const result = calculatorService.minus(5, 2);
      expect(result).toBe(3);
      expect(auditServiceMock.create).toHaveBeenCalledWith('Resta de 5 y 2');
    });

    it('should throw an error if operators are not valid', () => {
      expect(() => calculatorService.minus(NaN, 3)).toThrow('NotValidOperators');
      expect(() => calculatorService.minus(5, Infinity)).toThrow('NotValidOperators');
    });
  });


  describe('add', () => {
    it('should return the sum of two valid numbers', () => {
      const result = calculatorService.add(2, 3);
      expect(result).toBe(5);
      expect(auditServiceMock.create).toHaveBeenCalledWith('Suma de 2 y 3');
    });

    it('should throw an error if operators are not valid', () => {
      expect(() => calculatorService.add(NaN, 3)).toThrow('NotValidOperators');
      expect(() => calculatorService.add(2, Infinity)).toThrow('NotValidOperators');
      expect(() => calculatorService.add(null as unknown as number, 3)).toThrow('NotValidOperators');
      expect(() => calculatorService.add(2, undefined as unknown as number)).toThrow('NotValidOperators');
    });
  });

  describe('multiply', () => {
    it('should return the product of two valid numbers', () => {
      const result = calculatorService.multiply(4, 3);
      expect(result).toBe(12);
      expect(auditServiceMock.create).toHaveBeenCalledWith('Multiplicación de 4 y 3');
    });

    it('should throw an error if operators are not valid', () => {
      expect(() => calculatorService.multiply(NaN, 3)).toThrow('NotValidOperators');
      expect(() => calculatorService.multiply(Infinity, 3)).toThrow('NotValidOperators');
    });
  });

  describe('divide', () => {
    it('should return the division of two valid numbers', () => {
      const result = calculatorService.divide(10, 2);
      expect(result).toBe(5);
      expect(auditServiceMock.create).toHaveBeenCalledWith('División de 10 y 2');
    });

    it('should throw DivisionByZero if second operator is zero', () => {
      expect(() => calculatorService.divide(10, 0)).toThrow('DivisionByZero');
    });

    it('should throw an error if operators are not valid', () => {
      expect(() => calculatorService.divide(NaN, 3)).toThrow('NotValidOperators');
      expect(() => calculatorService.divide(10, Infinity)).toThrow('NotValidOperators');
    });
  });
});
