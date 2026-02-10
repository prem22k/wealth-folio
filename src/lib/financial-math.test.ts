import { describe, test } from 'node:test';
import assert from 'node:assert';
import { validateTransactionIntegrity, safeAdd, safeSubtract } from './financial-math';
import type { Transaction } from '@/types/schema';

// Helper to create a valid base transaction for testing
function createMockTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 'test-tx-123',
    userId: 'user-123',
    amount: 10000, // 100.00 INR
    date: new Date(),
    description: 'Test Transaction',
    category: 'Test Category',
    type: 'expense',
    source: 'cash',
    status: 'verified',
    ...overrides,
  } as Transaction;
}

describe('Financial Math Module', () => {
  describe('validateTransactionIntegrity', () => {
    test('should pass for a valid integer amount (Paise)', () => {
      const tx = createMockTransaction({ amount: 10000 });
      assert.doesNotThrow(() => validateTransactionIntegrity(tx));
    });

    test('should throw error if amount is not a number', () => {
      // @ts-expect-error Testing runtime validation
      const tx = createMockTransaction({ amount: "100" });
      assert.throws(() => validateTransactionIntegrity(tx), {
        message: /amount is not a number/
      });
    });

    test('should throw error if amount is NaN', () => {
      const tx = createMockTransaction({ amount: NaN });
      assert.throws(() => validateTransactionIntegrity(tx), {
        message: /amount is NaN/
      });
    });

    test('should throw error if amount is a float (e.g., 100.50)', () => {
      const tx = createMockTransaction({ amount: 100.50 });
      assert.throws(() => validateTransactionIntegrity(tx), {
        message: /has floating point amount/
      });
    });

    test('should throw error if amount exceeds safe integer limits', () => {
      const tx = createMockTransaction({ amount: Number.MAX_SAFE_INTEGER + 1 });
      assert.throws(() => validateTransactionIntegrity(tx), {
        message: /amount exceeds safe integer limits/
      });
    });
  });

  describe('safeAdd', () => {
    test('should add two integers correctly', () => {
      assert.strictEqual(safeAdd(100, 200), 300);
    });

    test('should handle rounding (e.g., inputs are floats)', () => {
      // 10.1 -> 10, 20.6 -> 21. Result: 31
      assert.strictEqual(safeAdd(10.1, 20.6), 31);
    });
  });

  describe('safeSubtract', () => {
    test('should subtract two integers correctly', () => {
      assert.strictEqual(safeSubtract(300, 100), 200);
    });

    test('should handle rounding', () => {
      // 30.6 -> 31, 10.1 -> 10. Result: 21
      assert.strictEqual(safeSubtract(30.6, 10.1), 21);
    });

    test('should handle negative results', () => {
      assert.strictEqual(safeSubtract(100, 200), -100);
    });
  });
});
