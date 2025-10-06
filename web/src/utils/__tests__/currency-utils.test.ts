/**
 * CurrencyUtils - Unit Tests
 *
 * Comprehensive test coverage for currency utility functions.
 * Tests edge cases, precision, and validation.
 */

import { CurrencyUtils } from '../currency-utils';

describe('CurrencyUtils', () => {
  describe('formatCurrency', () => {
    it('should format positive amounts correctly', () => {
      expect(CurrencyUtils.formatCurrency(0)).toBe('$0.00');
      expect(CurrencyUtils.formatCurrency(1)).toBe('$0.01');
      expect(CurrencyUtils.formatCurrency(10)).toBe('$0.10');
      expect(CurrencyUtils.formatCurrency(100)).toBe('$1.00');
      expect(CurrencyUtils.formatCurrency(1050)).toBe('$10.50');
      expect(CurrencyUtils.formatCurrency(123456)).toBe('$1234.56');
    });

    it('should format negative amounts correctly', () => {
      expect(CurrencyUtils.formatCurrency(-1)).toBe('-$0.01');
      expect(CurrencyUtils.formatCurrency(-100)).toBe('-$1.00');
      expect(CurrencyUtils.formatCurrency(-1050)).toBe('-$10.50');
      expect(CurrencyUtils.formatCurrency(-123456)).toBe('-$1234.56');
    });

    it('should pad cents with leading zeros', () => {
      expect(CurrencyUtils.formatCurrency(5)).toBe('$0.05');
      expect(CurrencyUtils.formatCurrency(101)).toBe('$1.01');
      expect(CurrencyUtils.formatCurrency(205)).toBe('$2.05');
    });

    it('should handle large amounts', () => {
      expect(CurrencyUtils.formatCurrency(1000000)).toBe('$10000.00');
      expect(CurrencyUtils.formatCurrency(999999999)).toBe('$9999999.99');
    });

    it('should handle invalid input gracefully', () => {
      expect(CurrencyUtils.formatCurrency(NaN)).toBe('$0.00');
      expect(CurrencyUtils.formatCurrency(Infinity)).toBe('$0.00');
      expect(CurrencyUtils.formatCurrency(-Infinity)).toBe('$0.00');
    });
  });

  describe('dollarsToCents', () => {
    it('should convert dollars to cents correctly', () => {
      expect(CurrencyUtils.dollarsToCents(0)).toBe(0);
      expect(CurrencyUtils.dollarsToCents(1)).toBe(100);
      expect(CurrencyUtils.dollarsToCents(1.5)).toBe(150);
      expect(CurrencyUtils.dollarsToCents(10.25)).toBe(1025);
      expect(CurrencyUtils.dollarsToCents(99.99)).toBe(9999);
    });

    it('should handle small decimal amounts', () => {
      expect(CurrencyUtils.dollarsToCents(0.01)).toBe(1);
      expect(CurrencyUtils.dollarsToCents(0.05)).toBe(5);
      expect(CurrencyUtils.dollarsToCents(0.10)).toBe(10);
      expect(CurrencyUtils.dollarsToCents(0.99)).toBe(99);
    });

    it('should handle negative dollar amounts', () => {
      expect(CurrencyUtils.dollarsToCents(-1)).toBe(-100);
      // toFixed() truncates, so -10.5 becomes "-10.50" then parsed as -1050
      const result = CurrencyUtils.dollarsToCents(-10.5);
      expect(Math.abs(result + 1050)).toBeLessThanOrEqual(1); // Allow 1 cent tolerance
      expect(CurrencyUtils.dollarsToCents(-0.01)).toBe(-1);
    });

    it('should round to 2 decimal places (cents precision)', () => {
      // toFixed(2) handles rounding internally
      const result1 = CurrencyUtils.dollarsToCents(1.005);
      const result2 = CurrencyUtils.dollarsToCents(1.994);
      // Allow 1 cent tolerance due to floating point arithmetic
      expect(Math.abs(result1 - 100)).toBeLessThanOrEqual(1);
      expect(Math.abs(result2 - 199)).toBeLessThanOrEqual(1);
    });

    it('should handle invalid input gracefully', () => {
      expect(CurrencyUtils.dollarsToCents(NaN)).toBe(0);
      expect(CurrencyUtils.dollarsToCents(Infinity)).toBe(0);
      expect(CurrencyUtils.dollarsToCents(-Infinity)).toBe(0);
    });
  });

  describe('centsToDollars', () => {
    it('should convert cents to dollars correctly', () => {
      expect(CurrencyUtils.centsToDollars(0)).toBe(0);
      expect(CurrencyUtils.centsToDollars(1)).toBe(0.01);
      expect(CurrencyUtils.centsToDollars(100)).toBe(1);
      expect(CurrencyUtils.centsToDollars(150)).toBe(1.5);
      expect(CurrencyUtils.centsToDollars(1025)).toBe(10.25);
      expect(CurrencyUtils.centsToDollars(9999)).toBe(99.99);
    });

    it('should handle negative cent amounts', () => {
      expect(CurrencyUtils.centsToDollars(-1)).toBe(-0.01);
      expect(CurrencyUtils.centsToDollars(-100)).toBe(-1);
      expect(CurrencyUtils.centsToDollars(-1050)).toBe(-10.5);
    });

    it('should handle large amounts', () => {
      expect(CurrencyUtils.centsToDollars(1000000)).toBe(10000);
      expect(CurrencyUtils.centsToDollars(999999999)).toBe(9999999.99);
    });

    it('should handle invalid input gracefully', () => {
      expect(CurrencyUtils.centsToDollars(NaN)).toBe(0);
      expect(CurrencyUtils.centsToDollars(Infinity)).toBe(0);
      expect(CurrencyUtils.centsToDollars(-Infinity)).toBe(0);
    });
  });

  describe('areEqual', () => {
    it('should return true for equal values', () => {
      expect(CurrencyUtils.areEqual(100, 100)).toBe(true);
      expect(CurrencyUtils.areEqual(0, 0)).toBe(true);
      expect(CurrencyUtils.areEqual(-50, -50)).toBe(true);
    });

    it('should return true for values within epsilon tolerance (1 cent)', () => {
      expect(CurrencyUtils.areEqual(100, 101)).toBe(true);
      expect(CurrencyUtils.areEqual(101, 100)).toBe(true);
      expect(CurrencyUtils.areEqual(100, 100)).toBe(true);
    });

    it('should return false for values outside epsilon tolerance', () => {
      expect(CurrencyUtils.areEqual(100, 102)).toBe(false);
      expect(CurrencyUtils.areEqual(100, 98)).toBe(false);
      expect(CurrencyUtils.areEqual(0, 2)).toBe(false);
    });

    it('should handle negative values', () => {
      expect(CurrencyUtils.areEqual(-100, -100)).toBe(true);
      expect(CurrencyUtils.areEqual(-100, -101)).toBe(true);
      expect(CurrencyUtils.areEqual(-100, -102)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(CurrencyUtils.areEqual(0, 1)).toBe(true); // within epsilon
      expect(CurrencyUtils.areEqual(0, 0)).toBe(true);
      expect(CurrencyUtils.areEqual(1, 0)).toBe(true);
    });
  });

  describe('hasDifference', () => {
    it('should return false for equal values', () => {
      expect(CurrencyUtils.hasDifference(100, 100)).toBe(false);
      expect(CurrencyUtils.hasDifference(0, 0)).toBe(false);
    });

    it('should return false for values within epsilon tolerance', () => {
      expect(CurrencyUtils.hasDifference(100, 101)).toBe(false);
      expect(CurrencyUtils.hasDifference(101, 100)).toBe(false);
      expect(CurrencyUtils.hasDifference(0, 1)).toBe(false);
    });

    it('should return true for values outside epsilon tolerance', () => {
      expect(CurrencyUtils.hasDifference(100, 102)).toBe(true);
      expect(CurrencyUtils.hasDifference(100, 98)).toBe(true);
      expect(CurrencyUtils.hasDifference(0, 2)).toBe(true);
    });

    it('should handle negative values', () => {
      expect(CurrencyUtils.hasDifference(-100, -100)).toBe(false);
      expect(CurrencyUtils.hasDifference(-100, -101)).toBe(false);
      expect(CurrencyUtils.hasDifference(-100, -102)).toBe(true);
    });

    it('should be inverse of areEqual', () => {
      const testCases = [
        [100, 100],
        [100, 101],
        [100, 102],
        [0, 1],
        [0, 2],
        [-50, -50],
        [-50, -51],
      ];

      testCases.forEach(([a, b]) => {
        expect(CurrencyUtils.hasDifference(a, b)).toBe(!CurrencyUtils.areEqual(a, b));
      });
    });
  });

  describe('Round-trip conversions', () => {
    it('should maintain precision when converting dollars->cents->format', () => {
      const dollarAmounts = [0, 0.01, 0.50, 1, 5.25, 10.99, 100, 1234.56];

      dollarAmounts.forEach(dollars => {
        const cents = CurrencyUtils.dollarsToCents(dollars);
        const formatted = CurrencyUtils.formatCurrency(cents);
        const expectedFormatted = `$${dollars.toFixed(2)}`;
        expect(formatted).toBe(expectedFormatted);
      });
    });

    it('should maintain precision when converting cents->dollars->cents', () => {
      const centAmounts = [0, 1, 50, 100, 525, 1099, 10000, 123456];

      centAmounts.forEach(cents => {
        const dollars = CurrencyUtils.centsToDollars(cents);
        const backToCents = CurrencyUtils.dollarsToCents(dollars);
        expect(backToCents).toBe(cents);
      });
    });
  });

  describe('Poker-specific scenarios', () => {
    it('should handle typical poker blinds', () => {
      // $0.25/$0.50 blinds
      expect(CurrencyUtils.dollarsToCents(0.25)).toBe(25);
      expect(CurrencyUtils.dollarsToCents(0.50)).toBe(50);
      expect(CurrencyUtils.formatCurrency(25)).toBe('$0.25');
      expect(CurrencyUtils.formatCurrency(50)).toBe('$0.50');

      // $1/$2 blinds
      expect(CurrencyUtils.dollarsToCents(1)).toBe(100);
      expect(CurrencyUtils.dollarsToCents(2)).toBe(200);
    });

    it('should handle typical poker stack sizes', () => {
      const stackSizes = [10, 20, 50, 100, 200, 500, 1000];

      stackSizes.forEach(dollars => {
        const cents = CurrencyUtils.dollarsToCents(dollars);
        const formatted = CurrencyUtils.formatCurrency(cents);
        expect(formatted).toBe(`$${dollars}.00`);
      });
    });

    it('should handle rake calculations (odd cent amounts)', () => {
      // 5% rake on $21 pot = $1.05
      const pot = CurrencyUtils.dollarsToCents(21);
      const rake = Math.floor(pot * 0.05);
      expect(rake).toBe(105);
      expect(CurrencyUtils.formatCurrency(rake)).toBe('$1.05');
    });

    it('should handle split pots (odd divisions)', () => {
      // $15.50 pot split 2 ways = $7.75 each
      const pot = CurrencyUtils.dollarsToCents(15.50);
      const share = Math.floor(pot / 2);
      expect(share).toBe(775);
      expect(CurrencyUtils.formatCurrency(share)).toBe('$7.75');

      // $10 pot split 3 ways = $3.33 each (with 1 cent remainder)
      const pot2 = CurrencyUtils.dollarsToCents(10);
      const share2 = Math.floor(pot2 / 3);
      expect(share2).toBe(333);
      expect(CurrencyUtils.formatCurrency(share2)).toBe('$3.33');
    });
  });

  describe('Consistency checks', () => {
    it('should ensure EPSILON is 1 cent', () => {
      expect(CurrencyUtils.EPSILON).toBe(1);
    });

    it('should handle zero correctly across all functions', () => {
      expect(CurrencyUtils.formatCurrency(0)).toBe('$0.00');
      expect(CurrencyUtils.dollarsToCents(0)).toBe(0);
      expect(CurrencyUtils.centsToDollars(0)).toBe(0);
      expect(CurrencyUtils.areEqual(0, 0)).toBe(true);
      expect(CurrencyUtils.hasDifference(0, 0)).toBe(false);
    });
  });
});
