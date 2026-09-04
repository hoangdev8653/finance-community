import { describe, it, expect } from 'vitest';
import {
  calculateCompoundInterest,
  calculateLoanSchedule,
  calculatePeValue,
  calculateGordonValue,
  calculateMarginOfSafety,
} from './financial-calculations';

describe('financial-calculations', () => {
  describe('calculateCompoundInterest', () => {
    it('calculates compound interest correctly without monthly contribution', () => {
      // 100M at 10% for 1 year compounded monthly = 100M * (1 + 0.1/12)^12 = 110,471,306
      const res = calculateCompoundInterest(100000000, 0, 10, 1);
      expect(res.totalContributed).toBe(100000000);
      expect(Math.round(res.finalBalance)).toBe(110471307);
      expect(Math.round(res.totalInterest)).toBe(10471307);
      expect(res.yearly).toHaveLength(1);
    });

    it('calculates compound interest correctly with monthly contribution', () => {
      const res = calculateCompoundInterest(100000000, 5000000, 10, 2);
      expect(res.totalContributed).toBe(100000000 + 5000000 * 24);
      expect(res.finalBalance).toBeGreaterThan(res.totalContributed);
      expect(res.yearly).toHaveLength(2);
    });
  });

  describe('calculateLoanSchedule', () => {
    it('calculates reducing balance loan correctly', () => {
      // Loan 120M, 1 year (12 months), 12%/year
      // Fixed principal = 10M/month
      // First month interest = 120M * 1% = 1.2M -> Total first month = 11.2M
      const res = calculateLoanSchedule(120000000, 12, 1, 'REDUCING_BALANCE');
      expect(res.totalPrincipal).toBe(120000000);
      expect(res.monthlyPaymentFirst).toBe(11200000);
      expect(res.monthlySchedule).toHaveLength(12);
      expect(res.yearlySchedule).toHaveLength(1);
      expect(res.yearlySchedule[0].remainingBalance).toBe(0);
    });

    it('calculates fixed payment loan correctly', () => {
      // Loan 120M, 1 year (12 months), 12%/year
      const res = calculateLoanSchedule(120000000, 12, 1, 'FIXED_PAYMENT');
      expect(Math.round(res.totalPrincipal)).toBe(120000000);
      expect(res.monthlySchedule).toHaveLength(12);
      // Fixed monthly payment should be identical each month
      const p1 = Math.round(res.monthlySchedule[0].totalMonthlyPayment);
      const p6 = Math.round(res.monthlySchedule[5].totalMonthlyPayment);
      expect(p1).toBe(p6);
      expect(Math.round(res.yearlySchedule[0].remainingBalance)).toBe(0);
    });
  });

  describe('calculatePeValue', () => {
    it('calculates fair value from EPS and PE', () => {
      expect(calculatePeValue(5000, 15)).toBe(75000);
    });
  });

  describe('calculateGordonValue', () => {
    it('calculates stock value from dividend growth model', () => {
      // D1 = 4000, g = 6%, r = 10% -> 4000 * 1.06 / (0.10 - 0.06) = 4240 / 0.04 = 106,000
      const val = calculateGordonValue(4000, 6, 10);
      expect(Math.round(val)).toBe(106000);
    });

    it('returns 0 when discount rate is less than or equal to growth rate', () => {
      expect(calculateGordonValue(4000, 10, 10)).toBe(0);
      expect(calculateGordonValue(4000, 12, 10)).toBe(0);
    });
  });

  describe('calculateMarginOfSafety', () => {
    it('calculates margin of safety discount price', () => {
      expect(calculateMarginOfSafety(100000, 20)).toBe(80000);
      expect(calculateMarginOfSafety(100000, 30)).toBe(70000);
    });
  });
});
